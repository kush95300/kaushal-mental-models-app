import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { LLMRouter } from "@/lib/llm/router";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Auth check
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse query parameters
    const searchParams = new URL(request.url).searchParams;
    const wsIdStr = searchParams.get("workspaceId");
    const botName = searchParams.get("botName") || "Betu";
    const type = searchParams.get("type") || "daily"; // "daily" | "weekly"
    const language = searchParams.get("language") || "english"; // "english" | "hinglish"
    const workspaceId = wsIdStr ? parseInt(wsIdStr) : null;

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    // 3. Verify workspace access
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: session.id },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace access denied" }, { status: 403 });
    }

    // 4. Calculate date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // 5. Query tasks
    let todayTasks: any[] = [];
    let completedToday = 0;
    let completedYesterday = 0;

    let pendingWeeklyTasks: any[] = [];
    let completedWeeklyTasksCount = 0;
    let totalCreatedWeeklyTasksCount = 0;

    if (type === "weekly") {
      pendingWeeklyTasks = await prisma.task.findMany({
        where: {
          workspaceId,
          isDeleted: false,
          status: "TODO",
          dueDate: {
            gte: today,
            lt: nextWeek,
          },
        },
        select: { content: true },
      });

      completedWeeklyTasksCount = await prisma.task.count({
        where: {
          workspaceId,
          isDeleted: false,
          status: "DONE",
          completedAt: {
            gte: sevenDaysAgo,
            lt: tomorrow,
          },
        },
      });

      totalCreatedWeeklyTasksCount = await prisma.task.count({
        where: {
          workspaceId,
          isDeleted: false,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });
    } else {
      // Today's pending tasks due today
      todayTasks = await prisma.task.findMany({
        where: {
          workspaceId,
          isDeleted: false,
          status: "TODO",
          dueDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        select: { content: true },
      });

      // Completed today
      completedToday = await prisma.task.count({
        where: {
          workspaceId,
          isDeleted: false,
          status: "DONE",
          completedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      // Completed yesterday
      completedYesterday = await prisma.task.count({
        where: {
          workspaceId,
          isDeleted: false,
          status: "DONE",
          completedAt: {
            gte: yesterday,
            lt: today,
          },
        },
      });
    }

    // Weekly tasks for quadrant advice
    const weeklyTasks = await prisma.task.findMany({
      where: {
        workspaceId,
        isDeleted: false,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: { quadrant: true },
    });

    // 6. Aggregate weekly quadrant metrics
    let qDo = 0;
    let qSchedule = 0;
    let qDelegate = 0;
    let qEliminate = 0;

    weeklyTasks.forEach((t) => {
      if (t.quadrant === "DO" || t.quadrant === "DO_FIRST") qDo++;
      else if (t.quadrant === "SCHEDULE") qSchedule++;
      else if (t.quadrant === "DELEGATE") qDelegate++;
      else if (t.quadrant === "ELIMINATE") qEliminate++;
    });

    const totalWeekly = qDo + qSchedule + qDelegate + qEliminate || 1;
    const pDo = Math.round((qDo / totalWeekly) * 100);
    const pSchedule = Math.round((qSchedule / totalWeekly) * 100);
    const pDelegate = Math.round((qDelegate / totalWeekly) * 100);
    const pEliminate = Math.round((qEliminate / totalWeekly) * 100);

    // Formulate advice
    let advice = "Your quadrants are balanced. Continue focusing on high-value tasks.";
    if (pDo > 50) {
      advice = `${pDo}% of your tasks this week were urgent and important. You are firefighting. Spend more time in Schedule to prevent firefighting.`;
    } else if (pSchedule > 50) {
      advice = `Excellent work! ${pSchedule}% of your tasks this week were in Schedule. You are planning ahead and focusing on long-term goals.`;
    } else if (pDelegate > 30) {
      advice = `You have spent ${pDelegate}% of tasks on delegation this week. Make sure you are delegating effectively to free up your own time.`;
    } else if (pEliminate > 20) {
      advice = `${pEliminate}% of your tasks this week fell into the Eliminate quadrant. Prune these time-wasters to regain focus.`;
    }

    // 7. Check if LLM is available, otherwise use fallback
    const availableProviders = LLMRouter.getAvailableProviders();
    let scriptText = "";
    let speechBriefingText = "";

    if (availableProviders.length > 0) {
      try {
        let systemPrompt = "";
        let prompt = "";

        if (type === "weekly") {
          systemPrompt = `You are ${botName}, a warm, professional, Alexa-style voice productivity assistant for The Wisdom Lab.
Analyze the user's weekly task statistics and generate a friendly, spoken weekly review and advisory briefing.
Keep sentences short, clear, and highly conversational.
Use a natural speaking flow suitable for Text-to-Speech (TTS). Do not use markdown tags, formatting, lists, or asterisks.

${language === "hinglish" 
  ? 'RESPOND IN HINGLISH: You must generate the review script. Provide two versions: "reply" in Roman Hinglish (Hindi words written in English/Latin script) for display, and "speech" in Devanagari script (Hindi characters/script) for voice synthesis.'
  : 'RESPOND IN ENGLISH: Generate the review script in English.'}

ALWAYS respond with valid JSON in this exact format:
{
  "reply": "your conversational weekly review briefing script here (in English, or Roman Hinglish if Hinglish is selected)",
  "speech": "only if Hinglish is selected: the Devanagari Hindi script translation of the weekly review briefing script, otherwise set to the same as reply"
}`;

          const pendingTaskNames = pendingWeeklyTasks.map((t) => t.content);
          prompt = `Here are the weekly productivity stats:
- Tasks completed in the past 7 days: ${completedWeeklyTasksCount}
- Tasks created in the past 7 days: ${totalCreatedWeeklyTasksCount}
- Pending tasks due in the next 7 days: ${pendingTaskNames.join(", ") || "None"}
- This week's quadrant breakdown:
  * Do First: ${qDo} tasks (${pDo}%)
  * Schedule: ${qSchedule} tasks (${pSchedule}%)
  * Delegate: ${qDelegate} tasks (${pDelegate}%)
  * Eliminate: ${qEliminate} tasks (${pEliminate}%)
- Weekly Advice based on quadrants: ${advice}

Please generate a weekly review briefing. Tell the user how many tasks they completed and created this past week. Mention their pending tasks for the coming week. Summarize their quadrant balance breakdown and read the weekly advice. Make it sound like a cohesive, encouraging speech.`;
        } else {
          systemPrompt = `You are ${botName}, a warm, professional, Alexa-style voice productivity assistant for The Wisdom Lab.
Analyze the user's task statistics and generate a friendly, spoken briefing.
Keep sentences short, clear, and highly conversational.
Use a natural speaking flow suitable for Text-to-Speech (TTS). Do not use markdown tags, formatting, lists, or asterisks.

${language === "hinglish" 
  ? 'RESPOND IN HINGLISH: You must generate the briefing script. Provide two versions: "reply" in Roman Hinglish (Hindi words written in English/Latin script) for display, and "speech" in Devanagari script (Hindi characters/script) for voice synthesis.'
  : 'RESPOND IN ENGLISH: Generate the briefing script in English.'}

ALWAYS respond with valid JSON in this exact format:
{
  "reply": "your conversational voice briefing script here (in English, or Roman Hinglish if Hinglish is selected)",
  "speech": "only if Hinglish is selected: the Devanagari Hindi script translation of the daily briefing script, otherwise set to the same as reply"
}`;

          const todayTasksNames = todayTasks.map((t) => t.content);
          prompt = `Here are the productivity stats for today:
- Tasks due today: ${todayTasksNames.join(", ") || "None"}
- Today's completed tasks: ${completedToday}
- Yesterday's completed tasks: ${completedYesterday}
- This week's quadrant breakdown:
  * Do First: ${qDo} tasks (${pDo}%)
  * Schedule: ${qSchedule} tasks (${pSchedule}%)
  * Delegate: ${qDelegate} tasks (${pDelegate}%)
  * Eliminate: ${qEliminate} tasks (${pEliminate}%)
- Weekly Advice based on quadrants: ${advice}

Please generate a daily briefing script. Tell the user what tasks they have today. Detail if their productivity increased, decreased, or remained the same compared to yesterday (e.g. completed more or fewer tasks). Tell them about their weekly quadrant balance and give them advice.`;
        }

        const { stream } = await LLMRouter.callWithFallback(systemPrompt, [
          { role: "user", content: prompt },
        ]);

        const reader = stream.getReader();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += value;
        }

        try {
          const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            scriptText = parsed.reply || parsed.text || accumulated;
            speechBriefingText = parsed.speech || scriptText;
          } else {
            scriptText = accumulated;
            speechBriefingText = accumulated;
          }
        } catch {
          scriptText = accumulated;
          speechBriefingText = accumulated;
        }
      } catch (err) {
        console.error("LLM briefing generation failed, falling back:", err);
      }
    }

    if (!scriptText) {
      if (type === "weekly") {
        const pendingTaskNames = pendingWeeklyTasks.map((t) => t.content);
        let script = "";
        let speechScript = "";

        if (language === "hinglish") {
          script = `Namaste! Main hoon aapka assistant ${botName}. Yeh hai aapka weekly tasks ka review. `;
          script += `Pichle saat dino mein, aapne ${completedWeeklyTasksCount} tasks complete kiye aur ${totalCreatedWeeklyTasksCount} naye tasks banaye. `;
          if (pendingWeeklyTasks.length === 0) {
            script += "Aane wale hafte ke liye koi pending tasks schedule nahi hain. Naye goals set karne ka yeh achha time hai. ";
          } else {
            script += `Aane wale saat dino mein, aapke paas ${pendingWeeklyTasks.length} tasks scheduled hain, jaise ki: ${pendingTaskNames.slice(0, 3).join(", ")}. `;
          }
          script += `Quadrant advice ke baare mein: ` + advice;

          speechScript = `नमस्ते! मैं हूँ आपका असिस्टेंट ${botName}। यह है आपका वीकली टास्क का रिव्यू। `;
          speechScript += `पिछले सात दिनों में, आपने ${completedWeeklyTasksCount} टास्क पूरे किए और ${totalCreatedWeeklyTasksCount} नए टास्क बनाए। `;
          if (pendingWeeklyTasks.length === 0) {
            speechScript += "आने वाले हफ्ते के लिए कोई पेंडिंग टास्क शेड्यूल नहीं हैं। नए गोल्स सेट करने का यह अच्छा समय है। ";
          } else {
            speechScript += `आने वाले सात दिनों में, आपके पास ${pendingWeeklyTasks.length} टास्क शेड्यूल्ड हैं, जैसे कि: ${pendingTaskNames.slice(0, 3).join(", ")}। `;
          }
          speechScript += `क्वाड्रंट एडवाइस के बारे में: ` + advice;
        } else {
          script = `Hello! I am ${botName}, your productivity assistant. Here is your weekly review. `;
          script += `In the past seven days, you completed ${completedWeeklyTasksCount} task${completedWeeklyTasksCount !== 1 ? "s" : ""} and created ${totalCreatedWeeklyTasksCount} new task${totalCreatedWeeklyTasksCount !== 1 ? "s" : ""}. `;
          if (pendingWeeklyTasks.length === 0) {
            script += "You have no tasks scheduled for the coming week. It is a great time to review your long-term goals. ";
          } else {
            script += `For the next seven days, you have ${pendingWeeklyTasks.length} task${pendingWeeklyTasks.length > 1 ? "s" : ""} scheduled, including: ${pendingTaskNames.slice(0, 3).join(", ")}. `;
          }
          script += `Regarding your quadrant balance: ` + advice;
          speechScript = script;
        }
        scriptText = script;
        speechBriefingText = speechScript;
      } else {
        const todayTasksNames = todayTasks.map((t) => t.content);
        let script = "";
        let speechScript = "";

        if (language === "hinglish") {
          script = `Namaste! Main hoon aapka assistant ${botName}. Yeh hai aapka daily briefing. `;
          if (todayTasks.length === 0) {
            script += "Aaj ke liye aapka koi task scheduled nahi hai. Naye tasks plan karne ke liye achha din hai. ";
          } else {
            script += `Aaj aapke paas ${todayTasks.length} tasks due hain: ${todayTasksNames.slice(0, 3).join(", ")}. `;
          }
          if (completedToday > completedYesterday) {
            script += `Aapka productivity level up hai! Aaj aapne ${completedToday} tasks completed kiye, jo ki kal se ${completedToday - completedYesterday} zyada hain. Momentum banaye rakhein! `;
          } else if (completedToday < completedYesterday) {
            script += `Aaj aapne ${completedToday} tasks complete kiye, jabki kal ${completedYesterday} kiye the. `;
          } else if (completedToday > 0) {
            script += `Aapne aaj ${completedToday} tasks complete kiye, kal jitne hi. `;
          }
          script += advice;

          speechScript = `नमस्ते! मैं हूँ आपका असिस्टेंट ${botName}। यह है आपका डेली ब्रीफिंग। `;
          if (todayTasks.length === 0) {
            speechScript += "आज के लिए आपका कोई टास्क शेड्यूल्ड नहीं है। नए टास्क प्लान करने के लिए अच्छा दिन है। ";
          } else {
            speechScript += `आज आपके पास ${todayTasks.length} टास्क ड्यू हैं: ${todayTasksNames.slice(0, 3).join(", ")}। `;
          }
          if (completedToday > completedYesterday) {
            speechScript += `आपका प्रोडक्टिविटी लेवल ऊपर है! आज आपने ${completedToday} टास्क पूरे किए, जो कि कल से ${completedToday - completedYesterday} ज़्यादा हैं। मोमेंटम बनाए रखें! `;
          } else if (completedToday < completedYesterday) {
            speechScript += `आज आपने ${completedToday} टास्क पूरे किए, जबकि कल ${completedYesterday} किए थे। `;
          } else if (completedToday > 0) {
            speechScript += `आपने आज ${completedToday} टास्क पूरे किए, कल जितने ही। `;
          }
          speechScript += advice;
        } else {
          script = `Hello! I am ${botName}, your productivity assistant. Here is your daily briefing. `;
          if (todayTasks.length === 0) {
            script += "You have no tasks scheduled for today. It's a great day to plan ahead or focus on deep learning. ";
          } else {
            script += `Today, you have ${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} due: ${todayTasksNames.slice(0, 3).join(", ")}${todayTasks.length > 3 ? ", and others" : ""}. `;
          }

          if (completedToday > completedYesterday) {
            script += `Your productivity is up! You completed ${completedToday} task${completedToday > 1 ? "s" : ""} today, which is ${completedToday - completedYesterday} more than yesterday. Keep up the momentum! `;
          } else if (completedToday < completedYesterday) {
            script += `You completed ${completedToday} task${completedToday > 1 ? "s" : ""} today, compared to ${completedYesterday} yesterday. `;
          } else if (completedToday > 0) {
            script += `You completed ${completedToday} task${completedToday > 1 ? "s" : ""} today, matching your progress from yesterday. `;
          }

          script += advice;
          speechScript = script;
        }
        scriptText = script;
        speechBriefingText = speechScript;
      }
    }

    return NextResponse.json({ success: true, briefing: scriptText, speechBriefing: speechBriefingText || scriptText });
  } catch (error) {
    console.error("Briefing API error:", error);
    return NextResponse.json({ error: "Failed to construct daily briefing" }, { status: 500 });
  }
}
