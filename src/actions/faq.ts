"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

const DEFAULT_FAQS = [
  {
    question: "What is the Eisenhower Matrix?",
    answer: "The Eisenhower Matrix is a 2x2 grid that categorizes tasks by Urgency and Importance, helping you prioritize what to do first, schedule, delegate, or eliminate.",
    isApproved: true,
  },
  {
    question: "How do I use workspaces?",
    answer: "Workspaces allow you to separate different areas of your life (e.g. Personal, Work, Side Projects). Each workspace has its own independent matrix of tasks and delegates.",
    isApproved: true,
  },
  {
    question: "What are delegates?",
    answer: "Delegates are team members, colleagues, or assistants whom you assign tasks to. In this app, delegating a task automatically schedules a short follow-up task for yourself to verify progress.",
    isApproved: true,
  },
  {
    question: "How does the daily briefing work?",
    answer: "The chatbot can generate an audio daily or weekly briefing summarizing your tasks, productivity status, and quadrant balance advice. Just click the Brief buttons in the chatbot welcome view!",
    isApproved: true,
  },
];

export async function getFAQs() {
  try {
    let faqs = await prisma.fAQ.findMany({
      where: { isApproved: true, NOT: { answer: null } },
      orderBy: { createdAt: "asc" },
    });

    // Seed default FAQs if the table is empty
    if (faqs.length === 0) {
      await prisma.fAQ.createMany({
        data: DEFAULT_FAQS,
      });
      faqs = await prisma.fAQ.findMany({
        where: { isApproved: true, NOT: { answer: null } },
        orderBy: { createdAt: "asc" },
      });
    }

    return { success: true, data: faqs };
  } catch (error) {
    console.error("Get FAQs error:", error);
    return { success: false, error: "Failed to fetch FAQs" };
  }
}

export async function submitFAQQuestion(question: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const qText = question?.trim();
    if (!qText) return { success: false, error: "Question cannot be empty" };

    const newFaq = await prisma.fAQ.create({
      data: {
        question: qText,
        answer: null,
        isApproved: false,
      },
    });

    return { success: true, data: newFaq };
  } catch (error) {
    console.error("Submit FAQ error:", error);
    return { success: false, error: "Failed to submit question" };
  }
}

export async function getPendingFAQs() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (!session.isAdmin) return { success: false, error: "Admin only" };

    const pending = await prisma.fAQ.findMany({
      where: {
        OR: [
          { isApproved: false },
          { answer: null },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: pending };
  } catch (error) {
    console.error("Get pending FAQs error:", error);
    return { success: false, error: "Failed to fetch pending FAQs" };
  }
}

export async function resolveFAQ(id: number, answer: string, approve: boolean) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (!session.isAdmin) return { success: false, error: "Admin only" };

    if (approve) {
      const ansText = answer?.trim();
      if (!ansText) return { success: false, error: "Answer cannot be empty" };

      await prisma.fAQ.update({
        where: { id },
        data: {
          answer: ansText,
          isApproved: true,
        },
      });
    } else {
      await prisma.fAQ.delete({
        where: { id },
      });
    }

    revalidatePath("/faq");
    return { success: true };
  } catch (error) {
    console.error("Resolve FAQ error:", error);
    return { success: false, error: "Failed to resolve FAQ" };
  }
}
