import gsap from 'gsap';
import { getRandomNumber } from './utils/getRandomNumber';
import { splitText } from './utils/splitText';

type Character = {
  element: Element;
  left: number;
  width: number;
  timeline: gsap.core.Timeline;
}

const container = document.getElementById('container');
const content = document.getElementById('content');
const name = document.getElementById('name');
let characters: Array<Character> = [];

function setContainerHeight(container: HTMLElement, content: HTMLElement) {
  container.style.height = `${content.offsetWidth + window.innerHeight}px`;
}

function getCharacterTimeline(element: Element): gsap.core.Timeline {
  const timeline = gsap.timeline({ paused: true });
  timeline.from(element, { xPercent: getRandomNumber(50, 100), yPercent: getRandomNumber(-100, 100), rotate: getRandomNumber(-45, 45), scale: getRandomNumber(0.5, 2), duration: 1 });
  return timeline;
}

if (name) {
  const characterElements = splitText(name);
  characterElements.forEach((characterElement) => {
    const { left, width } = characterElement.getBoundingClientRect(); // TODO: should use offsetLeft and width so we do not have to reset the scroll on resize
    console.log(characterElement)
    characters.push({
      element: characterElement,
      left,
      width,
      timeline: getCharacterTimeline(characterElement),
    });
  })
}

function updateCharacterTimelineProgress(character: Character, scrollDistance: number, contentOffsetLeft: number) {
  const characterTimelineProgress = gsap.utils.normalize(character.left, character.left + character.width, scrollDistance + contentOffsetLeft);
  gsap.to(character.timeline, { progress: characterTimelineProgress, duration: 0.3, ease: 'circ.out' });
  // character.timeline.progress(characterTimelineProgress);
}

document.body.addEventListener('scroll', ( ) => {
  const scrollDistance = document.body.scrollTop;
  gsap.set(content, { x: -`${scrollDistance}` });
  characters.forEach((character) => updateCharacterTimelineProgress(character, scrollDistance, content?.offsetLeft ?? 0))
})

let timeoutId: NodeJS.Timeout | null = null;

window.addEventListener('resize', () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    document.body.scrollTop = 0;
    if (container && content) setContainerHeight(container, content);
    characters.forEach((character) => {
      const { left, width } = character.element.getBoundingClientRect();
      character.left = left;
      character.width = width;
      character.timeline.progress(0);
    });
    timeoutId = null;
  }, 300)
});

if (container && content) setContainerHeight(container, content);

export {};
