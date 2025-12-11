export type ChapterCallout = {
  type: "note" | "tip" | "warning" | "example";
  content: string;
};

export type ChapterImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type ChapterSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  callouts?: ChapterCallout[];
  images?: ChapterImage[];
};

export type ChapterContent = {
  slug: string;
  number: number;
  title: string;
  level: string;
  duration: string;
  type: "Theory" | "Practice" | "Mixed";
  hook: string;
  learn: string[];
  sections: ChapterSection[];
  activities: string[];
  summary: string[];
  keyTerms: string[];
  nextSlug?: string;
};

export const chaptersContent: ChapterContent[] = [
  {
    slug: "the-nature-of-money",
    number: 1,
    title: "The Nature of Money",
    level: "Beginner",
    duration: "45–60 min",
    type: "Theory",
    hook: "Money fixes barter's double coincidence of wants, turning local swaps into markets.",
    learn: [
      "Why humans created money to solve barter's limitations",
      "The three essential functions of money: Medium of Exchange, Store of Value, Unit of Account",
      "Properties of sound money: Durable, Portable, Divisible, Recognizable, Scarce",
      "How money enabled economies to scale from local to global",
      "Why trust is the foundation of any monetary system",
    ],
    sections: [
      {
        heading: "Introduction",
        paragraphs: [
          "Imagine waking up in a world without money. You have bananas, but you're craving bread. You walk to the baker and offer him your bananas. The baker frowns and says, 'I don't want bananas today, I want shoes.'",
          "Now you're stuck. To get bread, you must first find a shoemaker who wants bananas, trade with him, and then go back to the baker with shoes. This back-and-forth feels exhausting and uncertain. This problem has a name: the 'double coincidence of wants.' Both sides must want exactly what the other has, at the same time, in the correct quantity.",
          "This is why humans invented money. Not because they admired shiny coins or pretty paper, but because cash solved the headache of trade. Money became the bridge — a universal tool that allowed people to exchange value without endless searching or awkward swaps.",
        ],
      },
      {
        heading: "1.1 Why Humans Created Money",
        paragraphs: [
          "In the earliest communities, people survived through barter trade. They exchanged cattle for salt, beads for grain, or iron tools for cloth. But barter was clumsy. Imagine trying to pay your rent with cassava or buying a motorbike with goats!",
          "As villages grew and trade stretched across regions, people needed something that everyone would accept. Societies turned to special items: shells, salt, beads, and eventually precious metals like gold and silver. These worked because they were widely trusted, didn't rot easily, and could be carried in your pocket.",
          "In Africa, cowrie shells became a common currency. In other places, silver and gold coins took center stage. Later, banks issued paper notes backed by those metals. Over centuries, money kept evolving — but its purpose stayed the same: to make trade easier, faster, and more reliable.",
          "Without money, economies would remain tiny and local. With money, people could build markets, cities, and eventually global trade. Money was the invisible thread that tied human progress together.",
        ],
        callouts: [
          {
            type: "example",
            content: "In Africa, cowrie shells became a common currency. In other places, silver and gold coins took center stage.",
          },
        ],
      },
      {
        heading: "1.2 Functions of Money — Medium of Exchange, Store of Value, Unit of Account",
        paragraphs: [
          "Money isn't just paper or numbers on a screen. It has three powerful functions that make it unique:",
        ],
        bullets: [
          "Medium of Exchange: Money removes the need for awkward bartering. Instead of finding someone who both wants your maize and has what you need, you can sell maize for money, then later buy anything else.",
          "Store of Value: Good money allows you to save for the future. If you work hard today, you want your earnings to keep their value tomorrow. But when money loses value, savings can vanish overnight.",
          "Unit of Account: Money provides a standard measure for prices. Instead of saying, 'one goat equals five chickens or three baskets of millet,' you simply say, 'one goat is 150,000 shillings.' This makes trade clear, simple, and consistent.",
        ],
        callouts: [
          {
            type: "example",
            content: "In Uganda today, you don't exchange sugarcane directly for airtime. You sell the sugarcane for shillings and use the shillings to buy airtime.",
          },
          {
            type: "warning",
            content: "Zimbabwe once experienced such extreme inflation that a loaf of bread cost billions of Zimbabwean dollars. People who saved in cash lost everything. Even in Uganda, the shilling has weakened against the US dollar, making imported goods more expensive year after year.",
          },
        ],
        paragraphs: [
          "Together, these functions explain why money is far more than paper. It is the organizer of trade, savings, and planning in every society.",
        ],
      },
      {
        heading: "1.3 Properties of Sound Money",
        paragraphs: [
          "Not all money is equally valid. Some forms of money fail quickly, while others stand the test of time. The best money has certain properties that make it reliable:",
        ],
        bullets: [
          "Durable – It should last. Gold and silver survive centuries. Salt or maize spoil.",
          "Portable – It should be easy to carry. A pocket full of coins beats dragging a cow around.",
          "Divisible – You should be able to split it into smaller parts. A shilling can be divided into coins, but you can't divide a cow without losing its value.",
          "Recognizable – People should instantly know it's real and not fake.",
          "Scarce – If it's too easy to create, it loses value. Gold was rare, which made it precious.",
        ],
        callouts: [
          {
            type: "note",
            content: "When money has these qualities, people trust it. Without trust, money collapses, and trade falls apart. That's why history is full of failed currencies, and also why societies continue to search for stronger, more stable money.",
          },
        ],
        images: [
          {
            src: "/images/money-properties-diagram.png",
            alt: "Diagram showing the five properties of sound money: Durable, Portable, Divisible, Recognizable, Scarce",
            caption: "The five essential properties of sound money",
          },
        ],
      },
    ],
    activities: [
      "Class Questions on 'What is Money?' (Open discussion – no wrong answers):",
      "• If money were to disappear tomorrow, how would people in your community trade?",
      "• Look around you: what item could work as money, and why?",
      "• Do you think your country's money is a good store of value? Why or why not?",
      "• Why do people still trust paper notes, even though they are no longer backed by gold or silver?",
      "• In your own words: What is money to you?",
    ],
    summary: [
      "Money solves the 'double coincidence of wants' problem that makes barter inefficient.",
      "Money has three essential functions: medium of exchange, store of value, and unit of account.",
      "Sound money must be durable, portable, divisible, recognizable, and scarce.",
      "Trust is the foundation of any monetary system — without it, money fails.",
      "Money enabled human progress by scaling trade from local to global markets.",
    ],
    keyTerms: [
      "Double coincidence of wants",
      "Medium of exchange",
      "Store of value",
      "Unit of account",
      "Durable",
      "Portable",
      "Divisible",
      "Recognizable",
      "Scarce",
    ],
    nextSlug: "the-journey-of-money",
  },
  // Continue with all other chapters with full detailed content...
];

