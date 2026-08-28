import { coursesData as sourceData } from './courses/index';

export const coursesData = sourceData;

export const getCourseByTitle = (title) => {
  return coursesData.find(c => c.title.toLowerCase() === title.toLowerCase());
};