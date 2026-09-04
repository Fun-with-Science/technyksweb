type LessonDefinition = readonly [
  title: string,
  videoId: string,
  duration: number,
  preview?: boolean,
];

const MODULES: ReadonlyArray<{
  id: string;
  title: string;
  lessons: ReadonlyArray<LessonDefinition>;
}> = [
  {
    id: 'ts-mod-01',
    title: 'Course Orientation & Fundamentals',
    lessons: [
      ['00. TypeScript Course Introduction', 'xQkn047-_1E', 320, true],
      ['1. Course Outline & Roadmap', 'ZIZalJKU_0k', 410, true],
      ['2. What is TypeScript?', '5qU6w3IQaNE', 490],
      ['3. TypeScript vs JavaScript', 'wDmORdV27sg', 520],
      [
        '4. Setup VS Code Editor & Understand the Difference',
        'R1eVBvdofko',
        580,
      ],
      ['5. How TypeScript Works & Why?', 'AaTVEoLLLuk', 460],
      ['6. Pros & Cons of TypeScript', '8chBa90Wpp0', 430],
    ],
  },
  {
    id: 'ts-mod-02',
    title: 'Compiler Setup & Tooling',
    lessons: [
      ['7. Setup TypeScript Compiler (tsc & tsconfig)', '1FANB6WXe1o', 610],
      ['8. Debugging TypeScript Applications in VS Code', 'lIIdyLa2d4I', 540],
    ],
  },
  {
    id: 'ts-mod-03',
    title: 'Type System & Primitive Types',
    lessons: [
      [
        '9. Basic Primitive Types (string, number, boolean)',
        'o6liGrs7Qnk',
        620,
      ],
      ["10. The 'any' Type & When to Avoid It", 'hncqP0SksRU', 480],
      ['11. Typed Arrays in TypeScript', '71uD25Oxqjw', 510],
      ['12. Tuples in TypeScript', '2hZn2zmC9io', 440],
      ['13. Numeric and String Enums', 'L5YTPWMiMNQ', 530],
      ["14. The 'unknown' Type & Safe Handling", 'neqPr6IVfHU', 490],
      ["15. The 'never' Type for Exhaustive Checks", 'oXPdEQh659Y', 470],
      ["16. The 'void' Type in Functions", '9KLd47hM7UA', 380],
      ['17. Type Inference & Type Assertions', 'HJXlIGAiAtQ', 560],
    ],
  },
  {
    id: 'ts-mod-04',
    title: 'Union Types, Narrowing & Aliases',
    lessons: [
      ['18. Union Types', 'XUnRxL4PXnc', 510],
      ['19. Type Narrowing & typeof Guards', 'tM4qxPNwwHw', 550],
      ['20. Interfaces, Type Aliases & Intersection Types', 'zTxrrZA2RJQ', 680],
      ['21. Optional Fields & Nullability', 'lauGMR6Qqss', 430],
    ],
  },
  {
    id: 'ts-mod-05',
    title: 'Functions & Practical Exercises',
    lessons: [
      ['22. Functions (Signatures, Parameters & Returns)', 'T0WVxMfv1rk', 590],
      ['23. Practice Problems & Guided Solutions', 'AkERZriKZMM', 720],
    ],
  },
  {
    id: 'ts-mod-06',
    title: 'Object-Oriented Programming & Classes',
    lessons: [
      [
        '24. Classes & Access Modifiers (public, private, protected)',
        'yp7HLK87Fkk',
        640,
      ],
      ['25. OOP Practice Problems & Inheritance', 'ha2Edtu9LTk', 660],
    ],
  },
  {
    id: 'ts-mod-07',
    title: 'Advanced Types & Generics',
    lessons: [
      ['26. Generics in Functions & Interfaces', 'mODVUhhesLQ', 750],
      ['27. Literal Types (String & Number Literals)', 'FR0FBe8REfc', 420],
      ['28. Custom Type Guards (is operator)', 'i4tLynHBK60', 480],
      ['29. The keyof Operator', 'aeY-u_WxPMc', 450],
      ['30. Index Signatures for Dynamic Objects', 'rMIPhdkA-og', 490],
      [
        '31. Built-in Utility Types (Partial, Pick, Omit, Record)',
        'IDMu5OVIYJQ',
        680,
      ],
    ],
  },
  {
    id: 'ts-mod-08',
    title: 'Modules, Decorators & Async',
    lessons: [
      ['32. Modules & Namespaces', '-PMX6oyDwgk', 520],
      ['33. Decorators & Metaprogramming', 'XJvKURacXjU', 610],
      ['34. Async Programming with Promises in TypeScript', 'U9lbI52soBk', 580],
      ['35. Non-null Assertion Operator (!)', '5FT4CCrX9Wk', 390],
    ],
  },
  {
    id: 'ts-mod-09',
    title: 'Technical Interview Mastery',
    lessons: [
      [
        '36. TypeScript Interview Questions & Core Concepts Review',
        'kRHJuBtpLI4',
        780,
      ],
    ],
  },
];

export const TYPESCRIPT_COURSE = {
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
  isPublished: true,
  modules: MODULES.map((module, moduleIndex) => ({
    id: module.id,
    title: module.title,
    order: moduleIndex + 1,
    lessons: module.lessons.map(
      ([title, videoId, duration, isFreePreview], lessonIndex) => ({
        id: `${module.id}-l${lessonIndex + 1}`,
        title,
        videoAssetRef: `youtube:${videoId}`,
        duration,
        order: lessonIndex + 1,
        isFreePreview: Boolean(isFreePreview),
      }),
    ),
  })),
};
