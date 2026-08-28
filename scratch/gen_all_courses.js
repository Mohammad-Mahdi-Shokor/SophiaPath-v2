import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateQuestions = (lessonId, topic) => {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `q-${lessonId}-${i + 1}`,
    prompt: `Question ${i + 1} about ${topic}: What is the core concept of ${topic} in this context?`,
    answers: [
      { id: `ans-${lessonId}-${i + 1}-1`, text: `Correct answer for ${topic} focus ${i + 1}`, isCorrect: true },
      { id: `ans-${lessonId}-${i + 1}-2`, text: `Distractor A for ${topic}`, isCorrect: false },
      { id: `ans-${lessonId}-${i + 1}-3`, text: `Distractor B for ${topic}`, isCorrect: false },
      { id: `ans-${lessonId}-${i + 1}-4`, text: `Distractor C for ${topic}`, isCorrect: false },
    ]
  }));
};

const generateLessons = (sectionId, sectionTopic, count = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${sectionId}-lesson-${i + 1}`,
    title: `${sectionTopic} Module ${i + 1}`,
    description: `Deep dive into ${sectionTopic} - Part ${i + 1}.`,
    questions: generateQuestions(`${sectionId}-lesson-${i + 1}`, sectionTopic)
  }));
};

const courses = [
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    domain: "Technology",
    description: "Learn to protect systems, networks, and programs from digital attacks.",
    about: "This path covers the fundamentals of network security, cryptography, and ethical hacking. You will learn how to identify vulnerabilities and defend against modern cyber threats.",
    sections: ["Security Basics", "Network Defense", "Offensive Security"]
  },
  {
    id: "mobile-dev",
    title: "Mobile Development",
    domain: "Technology",
    description: "Master the art of building cross-platform mobile applications.",
    about: "This comprehensive path covers everything from basic UI components to complex state management and native integrations. You will learn how to build apps that run seamlessly on both iOS and Android.",
    sections: ["Foundations & UI", "State & Logic", "Advanced Integration"]
  },
  {
    id: "physics",
    title: "Physics",
    domain: "Science",
    description: "Explore the fundamental principles that govern the universe.",
    about: "From classical mechanics to quantum physics, this course will take you on a journey through the laws of nature. Understand how the world works at its most fundamental level.",
    sections: ["Classical Mechanics", "Electromagnetism", "Quantum Basics"]
  },
  {
    id: "philosophy",
    title: "Philosophy",
    domain: "Humanities",
    description: "Delve into the big questions of life, knowledge, and reality.",
    about: "Explore the works of great thinkers and learn how to think critically about ethics, logic, and existence. This course provides a solid foundation in both Western and Eastern philosophical traditions.",
    sections: ["Ethics & Morality", "Logic & Reason", "Metaphysics"]
  }
];

courses.forEach(course => {
  const fullCourse = {
    ...course,
    totalLessons: 30,
    sections: course.sections.map((secTitle, i) => ({
      id: `${course.id}-sec-${i + 1}`,
      title: secTitle,
      lessons: generateLessons(`${course.id}-sec-${i + 1}`, secTitle)
    }))
  };

  const variableName = course.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) + "Course";
  const content = `export const ${variableName} = ` + JSON.stringify(fullCourse, null, 2) + ";";
  fs.writeFileSync(path.join(__dirname, `../src/data/courses/${course.id.replace('mobile-dev', 'mobileDev')}.js`), content, 'utf8');
});

console.log("All files written successfully");
