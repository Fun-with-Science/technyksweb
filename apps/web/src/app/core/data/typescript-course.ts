import type { Course } from '../services/courses.service';

interface TypeScriptLessonDef {
  title: string;
  videoAssetRef: string;
  duration: number;
  isFreePreview?: boolean;
}

interface TypeScriptModuleDef {
  id: string;
  title: string;
  order: number;
  lessons: TypeScriptLessonDef[];
}

const TS_MODULES: TypeScriptModuleDef[] = [
  {
    id: 'ts-mod-01',
    title: 'Course Orientation & Fundamentals',
    order: 1,
    lessons: [
      {
        title: '00. TypeScript Course Introduction',
        videoAssetRef: 'youtube:xQkn047-_1E',
        duration: 320,
        isFreePreview: true,
      },
      {
        title: '1. Course Outline & Roadmap',
        videoAssetRef: 'youtube:ZIZalJKU_0k',
        duration: 410,
        isFreePreview: true,
      },
      {
        title: '2. What is TypeScript?',
        videoAssetRef: 'youtube:5qU6w3IQaNE',
        duration: 490,
      },
      {
        title: '3. TypeScript vs JavaScript',
        videoAssetRef: 'youtube:wDmORdV27sg',
        duration: 520,
      },
      {
        title: '4. Setup VS Code Editor & Understand the Difference',
        videoAssetRef: 'youtube:R1eVBvdofko',
        duration: 580,
      },
      {
        title: '5. How TypeScript Works & Why?',
        videoAssetRef: 'youtube:AaTVEoLLLuk',
        duration: 460,
      },
      {
        title: '6. Pros & Cons of TypeScript',
        videoAssetRef: 'youtube:8chBa90Wpp0',
        duration: 430,
      },
    ],
  },
  {
    id: 'ts-mod-02',
    title: 'Compiler Setup & Tooling',
    order: 2,
    lessons: [
      {
        title: '7. Setup TypeScript Compiler (tsc & tsconfig)',
        videoAssetRef: 'youtube:1FANB6WXe1o',
        duration: 610,
      },
      {
        title: '8. Debugging TypeScript Applications in VS Code',
        videoAssetRef: 'youtube:lIIdyLa2d4I',
        duration: 540,
      },
    ],
  },
  {
    id: 'ts-mod-03',
    title: 'Type System & Primitive Types',
    order: 3,
    lessons: [
      {
        title: '9. Basic Primitive Types (string, number, boolean)',
        videoAssetRef: 'youtube:o6liGrs7Qnk',
        duration: 620,
      },
      {
        title: "10. The 'any' Type & When to Avoid It",
        videoAssetRef: 'youtube:hncqP0SksRU',
        duration: 480,
      },
      {
        title: '11. Typed Arrays in TypeScript',
        videoAssetRef: 'youtube:71uD25Oxqjw',
        duration: 510,
      },
      {
        title: '12. Tuples in TypeScript',
        videoAssetRef: 'youtube:2hZn2zmC9io',
        duration: 440,
      },
      {
        title: '13. Numeric and String Enums',
        videoAssetRef: 'youtube:L5YTPWMiMNQ',
        duration: 530,
      },
      {
        title: "14. The 'unknown' Type & Safe Handling",
        videoAssetRef: 'youtube:neqPr6IVfHU',
        duration: 490,
      },
      {
        title: "15. The 'never' Type for Exhaustive Checks",
        videoAssetRef: 'youtube:oXPdEQh659Y',
        duration: 470,
      },
      {
        title: "16. The 'void' Type in Functions",
        videoAssetRef: 'youtube:9KLd47hM7UA',
        duration: 380,
      },
      {
        title: '17. Type Inference & Type Assertions',
        videoAssetRef: 'youtube:HJXlIGAiAtQ',
        duration: 560,
      },
    ],
  },
  {
    id: 'ts-mod-04',
    title: 'Union Types, Narrowing & Aliases',
    order: 4,
    lessons: [
      {
        title: '18. Union Types',
        videoAssetRef: 'youtube:XUnRxL4PXnc',
        duration: 510,
      },
      {
        title: '19. Type Narrowing & typeof Guards',
        videoAssetRef: 'youtube:tM4qxPNwwHw',
        duration: 550,
      },
      {
        title: '20. Interfaces, Type Aliases & Intersection Types',
        videoAssetRef: 'youtube:zTxrrZA2RJQ',
        duration: 680,
      },
      {
        title: '21. Optional Fields & Nullability',
        videoAssetRef: 'youtube:lauGMR6Qqss',
        duration: 430,
      },
    ],
  },
  {
    id: 'ts-mod-05',
    title: 'Functions & Practical Exercises',
    order: 5,
    lessons: [
      {
        title: '22. Functions (Signatures, Parameters & Returns)',
        videoAssetRef: 'youtube:T0WVxMfv1rk',
        duration: 590,
      },
      {
        title: '23. Practice Problems & Guided Solutions',
        videoAssetRef: 'youtube:AkERZriKZMM',
        duration: 720,
      },
    ],
  },
  {
    id: 'ts-mod-06',
    title: 'Object-Oriented Programming & Classes',
    order: 6,
    lessons: [
      {
        title: '24. Classes & Access Modifiers (public, private, protected)',
        videoAssetRef: 'youtube:yp7HLK87Fkk',
        duration: 640,
      },
      {
        title: '25. OOP Practice Problems & Inheritance',
        videoAssetRef: 'youtube:ha2Edtu9LTk',
        duration: 660,
      },
    ],
  },
  {
    id: 'ts-mod-07',
    title: 'Advanced Types & Generics',
    order: 7,
    lessons: [
      {
        title: '26. Generics in Functions & Interfaces',
        videoAssetRef: 'youtube:mODVUhhesLQ',
        duration: 750,
      },
      {
        title: '27. Literal Types (String & Number Literals)',
        videoAssetRef: 'youtube:FR0FBe8REfc',
        duration: 420,
      },
      {
        title: '28. Custom Type Guards (is operator)',
        videoAssetRef: 'youtube:i4tLynHBK60',
        duration: 480,
      },
      {
        title: '29. The keyof Operator',
        videoAssetRef: 'youtube:aeY-u_WxPMc',
        duration: 450,
      },
      {
        title: '30. Index Signatures for Dynamic Objects',
        videoAssetRef: 'youtube:rMIPhdkA-og',
        duration: 490,
      },
      {
        title: '31. Built-in Utility Types (Partial, Pick, Omit, Record)',
        videoAssetRef: 'youtube:IDMu5OVIYJQ',
        duration: 680,
      },
    ],
  },
  {
    id: 'ts-mod-08',
    title: 'Modules, Decorators & Async',
    order: 8,
    lessons: [
      {
        title: '32. Modules & Namespaces',
        videoAssetRef: 'youtube:-PMX6oyDwgk',
        duration: 520,
      },
      {
        title: '33. Decorators & Metaprogramming',
        videoAssetRef: 'youtube:XJvKURacXjU',
        duration: 610,
      },
      {
        title: '34. Async Programming with Promises in TypeScript',
        videoAssetRef: 'youtube:U9lbI52soBk',
        duration: 580,
      },
      {
        title: '35. Non-null Assertion Operator (!)',
        videoAssetRef: 'youtube:5FT4CCrX9Wk',
        duration: 390,
      },
    ],
  },
  {
    id: 'ts-mod-09',
    title: 'Technical Interview Mastery',
    order: 9,
    lessons: [
      {
        title: '36. TypeScript Interview Questions & Core Concepts Review',
        videoAssetRef: 'youtube:kRHJuBtpLI4',
        duration: 780,
      },
    ],
  },
];

export const TYPESCRIPT_COURSE: Course = {
  id: 'course-typescript-2026',
  slug: 'complete-typescript-course',
  title: 'Complete TypeScript Course | Beginner to Advanced TypeScript Mastery',
  subtitle:
    'Master modern TypeScript from fundamentals to advanced types, generics, decorators, async patterns, and real-world architectures.',
  description:
    'A complete TypeScript learning path taking you from absolute basics to advanced enterprise engineering. Master static typing, primitives, tuples, enums, unions, narrowing, interfaces, classes, generics, utility types, modules, decorators, and interview questions with hands-on practice.',
  thumbnail: '/assets/course-typescript.png',
  promoVideoUrl: 'https://www.youtube.com/watch?v=xQkn047-_1E',
  price: 999,
  isFree: false,
  currency: 'INR',
  level: 'Beginner',
  category: 'Web Development',
  status: 'LIVE',
  isPublished: true,
  earnedThisMonth: 0,
  enrollmentsThisMonth: 0,
  rating: 5.0,
  reviewCount: 18,
  modules: TS_MODULES.map((mod) => ({
    id: mod.id,
    title: mod.title,
    order: mod.order,
    lessons: mod.lessons.map((lesson, idx) => ({
      id: `${mod.id}-l${idx + 1}`,
      title: lesson.title,
      videoAssetRef: lesson.videoAssetRef,
      duration: lesson.duration,
      order: idx + 1,
      isFreePreview: !!lesson.isFreePreview,
    })),
  })),
};
