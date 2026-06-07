export interface VideoTrack {
  id: number;
  title: string;
  duration: number; // in seconds
  chapters: { time: number; title: string }[];
  subtitles: { start: number; end: number; text: { en: string; hi: string; hinglish: string } }[];
}

export const TRACKS: VideoTrack[] = [
  {
    id: 1,
    title: "1. What is Mental Models?",
    duration: 45,
    chapters: [
      { time: 0, title: "Overview" },
      { time: 15, title: "Simplifying Complexity" },
      { time: 30, title: "Framework Toolkit" }
    ],
    subtitles: [
      {
        start: 0,
        end: 15,
        text: {
          en: "Mental models are cognitive frameworks that help us simplify complexity and make better decisions. They organize information to let us think more clearly.",
          hi: "मानसिक मॉडल संज्ञानात्मक ढांचे हैं जो हमें जटिलता को सरल बनाने और बेहतर निर्णय लेने में मदद करते हैं। वे जानकारी को व्यवस्थित करते हैं ताकि हम अधिक स्पष्ट रूप से सोच सकें।",
          hinglish: "Mental models aise cognitive frameworks hain jo complexity ko simple banane aur better decisions lene mein madad karte hain. Ye information ko organize karte hain taaki hum clear thinking kar sakein."
        }
      },
      {
        start: 15,
        end: 30,
        text: {
          en: "Instead of remembering every detail, they offer structured templates to filter noise. By adopting these models, we align our energy with what works.",
          hi: "हर विवरण को याद रखने के बजाय, वे शोर को छानने के लिए संरचित टेम्पलेट प्रदान करते हैं। इन मॉडलों को अपनाकर, हम अपनी ऊर्जा को उसके साथ जोड़ते हैं जो काम करता है।",
          hinglish: "Har detail ko yaad rakhne ke bajaye, ye noise ko filter karne ke liye structured templates offer karte hain. In models ko adopt karke, hum apni energy ko right direction mein align karte hain."
        }
      },
      {
        start: 30,
        end: 45,
        text: {
          en: "In this application, we provide tools like the Eisenhower Matrix to help you organize tasks based on strategic urgency and long term importance.",
          hi: "इस एप्लिकेशन में, हम रणनीतिक तात्कालिकता और दीर्घकालिक महत्व के आधार पर कार्यों को व्यवस्थित करने में आपकी सहायता के लिए आइजनहावर मैट्रिक्स जैसे उपकरण प्रदान करते हैं।",
          hinglish: "Is application mein, hum strategic urgency aur long-term importance ke basis par tasks ko organize karne ke liye Eisenhower Matrix jaise tools provide karte hain."
        }
      }
    ]
  },
  {
    id: 2,
    title: "2. What is the Eisenhower Matrix?",
    duration: 90,
    chapters: [
      { time: 0, title: "Introduction" },
      { time: 15, title: "Structure Overview" },
      { time: 30, title: "Q1: Do First" },
      { time: 42, title: "Q2: Schedule" },
      { time: 54, title: "Q3: Delegate" },
      { time: 66, title: "Q4: Eliminate" },
      { time: 78, title: "Logic Summary" }
    ],
    subtitles: [
      {
        start: 0,
        end: 15,
        text: {
          en: "The Eisenhower Matrix is a simple decision-making tool designed to prioritize tasks by urgency and importance. Its core purpose is to help you focus on long-term value.",
          hi: "आइजनहावर मैट्रिक्स तात्कालिकता और महत्व के आधार पर कार्यों को प्राथमिकता देने के लिए डिज़ाइन किया गया एक सरल निर्णय लेने का उपकरण है। इसका मुख्य उद्देश्य आपको दीर्घकालिक मूल्य पर ध्यान केंद्रित करने में मदद करना है।",
          hinglish: "Eisenhower Matrix ek simple decision-making tool hai jo urgency aur importance ke basis par tasks ko prioritize karta hai. Iska core purpose aapko long-term value par focus karne mein madad karna hai."
        }
      },
      {
        start: 15,
        end: 30,
        text: {
          en: "It divides tasks into four distinct quadrants based on these two dimensions. This structure helps you visualize what needs your immediate attention versus what can wait.",
          hi: "यह इन दो आयामों के आधार पर कार्यों को चार अलग-अलग चतुर्थांशों में विभाजित करता है। यह संरचना आपको यह देखने में मदद करती है कि किस पर तुरंत ध्यान देने की आवश्यकता है और क्या प्रतीक्षा कर सकता है।",
          hinglish: "Ye tasks ko in do dimensions ke basis par chaar distinct quadrants mein divide karta hai. Is structure se aap visualize kar sakte hain ki kispar immediate attention chahiye aur kya wait kar sakta hai."
        }
      },
      {
        start: 30,
        end: 42,
        text: {
          en: "Quadrant 1 contains Urgent and Important tasks that you must Do First. These are immediate crises or critical deadlines that need action today.",
          hi: "चतुर्थांश 1 में तत्काल और महत्वपूर्ण कार्य शामिल हैं जिन्हें आपको सबसे पहले करना चाहिए। ये तत्काल संकट या महत्वपूर्ण समय सीमाएं हैं जिन पर आज ही कार्रवाई की आवश्यकता है।",
          hinglish: "Quadrant 1 mein wo Urgent aur Important tasks aate hain jo aapko Do First karne hote hain. Ye immediate crises ya critical deadlines hote hain jinpar aaj hi action lena zaroori hai."
        }
      },
      {
        start: 42,
        end: 54,
        text: {
          en: "Quadrant 2 is for Important but Not Urgent tasks. This is the Schedule quadrant, representing strategic planning, self-growth, and key objectives.",
          hi: "चतुर्थांश 2 महत्वपूर्ण लेकिन गैर-तत्काल कार्यों के लिए है। यह 'शेड्यूल' चतुर्थांश है, जो रणनीतिक योजना, व्यक्तिगत विकास और प्रमुख लक्ष्यों का प्रतिनिधित्व करता है।",
          hinglish: "Quadrant 2 Important but Not Urgent tasks ke liye hai. Ise Schedule quadrant kehte hain, jo strategic planning, self-growth, aur key objectives ko represent karta hai."
        }
      },
      {
        start: 54,
        end: 66,
        text: {
          en: "Quadrant 3 is for Urgent but Not Important tasks. This is the Delegate quadrant, where tasks are handed off to other team members to protect your focus.",
          hi: "चतुर्थांश 3 तत्काल लेकिन गैर-महत्वपूर्ण कार्यों के लिए है। यह 'डेलिगेट' चतुर्थांश है, जहां आपकी एकाग्रता की रक्षा के लिए कार्यों को टीम के अन्य सदस्यों को सौंप दिया जाता है।",
          hinglish: "Quadrant 3 Urgent but Not Important tasks ke liye hai. Ise Delegate quadrant kehte hain, jahan aapke focus ko protect karne ke liye tasks ko team ke dusre members ko hand off kiya jata hai."
        }
      },
      {
        start: 66,
        end: 78,
        text: {
          en: "Quadrant 4 contains Not Urgent and Not Important tasks. This is the Eliminate quadrant, representing low-priority distractions that should be cleared.",
          hi: "चतुर्थांश 4 में गैर-तत्काल और गैर-महत्वपूर्ण कार्य शामिल हैं। यह 'एलिमिनेट' चतुर्थांश है, जो कम प्राथमिकता वाले विकर्षणों का प्रतिनिधित्व करता है जिन्हें हटा दिया जाना चाहिए।",
          hinglish: "Quadrant 4 mein Not Urgent aur Not Important tasks aate hain. Ise Eliminate quadrant kehte hain, jo low-priority distractions ko represent karta hai jise clear karna chahiye."
        }
      },
      {
        start: 78,
        end: 90,
        text: {
          en: "By using the matrix, you optimize your workflow by shifting your attention away from reactions, and towards strategic, high-value scheduled planning.",
          hi: "मैट्रिक्स का उपयोग करके, आप अपनी एकाग्रता को प्रतिक्रियाओं से हटाकर रणनीतिक, उच्च-मूल्य वाली योजना की ओर ले जाते हैं और अपने कार्यप्रवाह को अनुकूलित करते हैं।",
          hinglish: "Matrix ko use karke, aap reaction se hatkar strategic aur high-value scheduled planning par focus karte hain aur apne workflow ko optimize karte hain."
        }
      }
    ]
  },
  {
    id: 3,
    title: "3. Adding & Moving Tasks",
    duration: 45,
    chapters: [
      { time: 0, title: "Inbox Queue" },
      { time: 15, title: "Drag & Drop" },
      { time: 30, title: "Marking Done" }
    ],
    subtitles: [
      {
        start: 0,
        end: 15,
        text: {
          en: "To add a task, type the objective and optional estimated minutes in the input queue. Press Enter to draft it directly into your Inbox.",
          hi: "कार्य जोड़ने के लिए, इनपुट कतार में उद्देश्य और वैकल्पिक अनुमानित समय टाइप करें। इसे सीधे अपने इनबॉक्स में ड्रॉफ्ट करने के लिए एंटर दबाएं।",
          hinglish: "New task add karne ke liye, input queue mein objective aur optional time estimate type karein. Enter press karke ise directly Inbox mein draft karein."
        }
      },
      {
        start: 15,
        end: 30,
        text: {
          en: "Drag the task from your Inbox and drop it into any quadrant. You will be prompted to choose due dates, times, or team delegates contextually.",
          hi: "कार्य को अपने इनबॉक्स से खींचें और किसी भी चतुर्थांश में छोड़ें। आपको संदर्भ के अनुसार नियत तारीखें, समय या टीम प्रतिनिधियों को चुनने के लिए कहा जाएगा।",
          hinglish: "Task ko Inbox se drag karke kisi bhi quadrant mein drop karein. Aapko due dates, times, ya team delegates choose karne ka dynamic option milega."
        }
      },
      {
        start: 30,
        end: 45,
        text: {
          en: "To mark a task as done, click its checkbox. You will be prompted to enter the actual minutes spent, which updates your productivity velocity metrics.",
          hi: "कार्य को पूरा के रूप में चिह्नित करने के लिए, इसके चेकबॉक्स पर क्लिक करें। आपको खर्च किए गए वास्तविक समय को दर्ज करने के लिए कहा जाएगा, जो आपकी उत्पादकता गति मेट्रिक्स को अपडेट करता है।",
          hinglish: "Task ko done mark karne ke liye checkbox par click karein. Aapko actual spent time enter karne ka option milega jo aapki productivity velocity metrics ko update karega."
        }
      }
    ]
  },
  {
    id: 4,
    title: "4. Key Platform Features",
    duration: 48,
    chapters: [
      { time: 0, title: "Workspaces" },
      { time: 12, title: "Analytics" },
      { time: 24, title: "Delegates" },
      { time: 36, title: "Cleanup & Resets" }
    ],
    subtitles: [
      {
        start: 0,
        end: 12,
        text: {
          en: "Workspaces isolate different contexts like Work and Personal. Each workspace operates with its own task list and team members.",
          hi: "कार्यक्षेत्र (वर्कस्पेस) विभिन्न संदर्भों जैसे कि कार्य और व्यक्तिगत को अलग करते हैं। प्रत्येक कार्यक्षेत्र अपनी कार्य सूची और टीम के सदस्यों के साथ संचालित होता है।",
          hinglish: "Workspaces se aap Work aur Personal jaise different contexts ko isolate kar sakte hain. Har workspace ki apni task list aur team members hote hain."
        }
      },
      {
        start: 12,
        end: 24,
        text: {
          en: "The Analytics Dashboard visualizes completion rates, quadrant distributions, task velocity graphs, and delegation workloads.",
          hi: "एनालिटिक्स डैशबोर्ड पूर्णता दर, चतुर्थांश वितरण, कार्य गति ग्राफ और सौंपे गए कार्यों के कार्यभार को दर्शाता है।",
          hinglish: "Analytics Dashboard par aap completion rates, quadrant distributions, task velocity graphs aur delegation workloads ko visually track kar sakte hain."
        }
      },
      {
        start: 24,
        end: 36,
        text: {
          en: "Delegate Management allows you to create and manage team member profiles to easily assign work in the Delegate quadrant.",
          hi: "प्रतिनिधि (डेलिगेट) प्रबंधन आपको डेलिगेट चतुर्थांश में आसानी से काम सौंपने के लिए टीम के सदस्यों के प्रोफाइल बनाने और प्रबंधित करने की अनुमति देता है।",
          hinglish: "Delegate Management se aap team members ke profiles create aur manage kar sakte hain taaki Delegate quadrant mein tasks easily assign kiye ja sakein."
        }
      },
      {
        start: 36,
        end: 48,
        text: {
          en: "Easily clean up your dashboard by resetting today's tasks, archiving completions, or clearing deleted items to maintain a tidy slate.",
          hi: "एक साफ-सुथरा डैशबोर्ड बनाए रखने के लिए आज के कार्यों को रीसेट करके, पूर्ण किए गए कार्यों को संग्रहीत करके, या हटाए गए आइटमों को साफ करके आसानी से अपने डैशबोर्ड को व्यवस्थित करें।",
          hinglish: "Apne dashboard ko clean rakhne ke liye aaj ke tasks ko reset karein, completed items ko archive karein ya deleted items ko clear karein."
        }
      }
    ]
  }
];
