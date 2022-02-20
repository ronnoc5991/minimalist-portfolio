import gsap from 'gsap';
import { getRandomNumber } from './utils/getRandomNumber';
import { splitText } from './utils/splitText';
import type {Character} from "@/types/Character";

const topMask = document.getElementById('top-mask');
const bottomMask = document.getElementById('bottom-mask');

const container = document.getElementById('container');
const content = document.getElementById('content');
const textWrapper = document.getElementById('text-wrapper');
let characters: Array<Character> = [];

function setContainerHeight(container: HTMLElement, content: HTMLElement) {
  container.style.height = `${content.offsetWidth + window.innerHeight + window.innerWidth * 2}px`;
}

function getCharacterTimeline(element: Element): gsap.core.Timeline {
  const timeline = gsap.timeline({ paused: true });
  timeline.from(element, { xPercent: getRandomNumber(-100, 100), y: getRandomNumber(-window.innerHeight / 4, window.innerHeight / 4), rotate: getRandomNumber(-45, 45), scale: getRandomNumber(0.5, 2), duration: 1, ease: 'back.inOut' });
  return timeline;
}

function updateCharacterTimelineProgress(character: Character, scrollDistance: number, contentOffsetLeft: number) {
  const characterTimelineProgress = gsap.utils.normalize(character.left, character.left + character.width, scrollDistance + contentOffsetLeft);
  gsap.to(character.timeline, { progress: characterTimelineProgress, duration: 0.5, ease: 'none' });
}

function getMaskTimeline(mask: HTMLElement, position: 'top' | 'bottom') {
  const timeline = gsap.timeline({ paused: true });
  timeline.fromTo(mask, { clipPath: `ellipse(150% 150% at 0% ${position === 'top' ? '0%' : '100%'})` }, { clipPath: `ellipse(150% 150% at 0% ${position === 'top' ? '-150%' : '250%'})`, duration: 1, ease: 'sine.out' });
  return timeline;
}

let topMaskTimeline: gsap.core.Timeline;
let bottomMaskTimeline: gsap.core.Timeline;

if (topMask && bottomMask) {
  topMaskTimeline = getMaskTimeline(topMask, 'top');
  bottomMaskTimeline = getMaskTimeline(bottomMask, 'bottom');
}

function updateMaskTimelines(scrollDistance: number) {
  if (!content) return;
  const progress = gsap.utils.normalize(content.offsetWidth + window.innerWidth / 8, content.offsetWidth + window.innerWidth, scrollDistance);
  gsap.set([topMaskTimeline, bottomMaskTimeline], { progress: progress });
}

if (textWrapper) {
  const characterElements = [...textWrapper.children].map((child) => splitText(child as HTMLElement)).reduce((previous, current) => previous.concat(current));
  characterElements.forEach((characterElement) => {
    const { left, width } = characterElement.getBoundingClientRect(); // TODO: should use offsetLeft and width so we do not have to reset the scroll on resize
    characters.push({
      element: characterElement,
      left,
      width,
      timeline: getCharacterTimeline(characterElement),
    });
  });
}

// 175vw

document.body.addEventListener('scroll', (event: Event ) => {
  const scrollDistance = document.body.scrollTop;
  gsap.set(content, { x: -`${scrollDistance}` });
  characters.forEach((character) => updateCharacterTimelineProgress(character, scrollDistance, content?.offsetLeft ?? 0))
  updateMaskTimelines(scrollDistance);
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
