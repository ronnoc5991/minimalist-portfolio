import gsap from 'gsap';
import { getRandomNumber } from './utils/getRandomNumber';
import { splitText } from './utils/splitText';
import type {Character} from "@/types/Character";

const scrollContainer = document.getElementById('scroll-container');
const text = document.getElementById('text');
const name = document.getElementById('name');
const role = document.getElementById('role');
const maskedContainer = document.getElementById('masked-container');
const maskStartPosition = document.getElementById('mask-start-position');
let characters: Array<Character> = [];
let maskedContainerTimeline: gsap.core.Timeline;

const getIntroductionScrollStart = () => 0;
const getIntroductionScrollEnd = () => (name?.offsetWidth || 0) + (role?.offsetWidth || 0)
const getIntroductionScrollDuration = () => getIntroductionScrollEnd() - getIntroductionScrollStart();

const getMaskOpenStart = () => getIntroductionScrollEnd();
const getMaskOpenScrollDuration = () => window.innerHeight;
const getMaskOpenEnd = () => getMaskOpenStart() + getMaskOpenScrollDuration();

function getMaskedContentClipPath(maskStartPosition: HTMLElement, position: 'beginning' | 'end') {
  const { top, left, width, height } = maskStartPosition.getBoundingClientRect();
  const viewportMaximum = Math.max(window.innerWidth, window.innerHeight);
  const offset = position === 'end' ? viewportMaximum * 2 : 0;
  return `inset(${top - offset}px ${window.innerWidth - (left + width) - offset}px ${window.innerHeight - (top + height) - offset}px ${left - offset}px round ${viewportMaximum}px)`;
}

function getMaskedContainerTimeline(maskedContainer: HTMLElement, beginningClipPath: string, endClipPath: string): gsap.core.Timeline {
  return gsap.timeline({ paused: true }).fromTo(maskedContainer, { clipPath: beginningClipPath }, { clipPath: endClipPath, duration: 1, ease: 'sine.in' });
}

function updateMaskedContainerTimelineProgress(maskedContainerTimeline: gsap.core.Timeline, scrollDistance: number) {
  const progress = gsap.utils.normalize(getMaskOpenStart(),  getMaskOpenEnd(), scrollDistance);
  gsap.set(maskedContainerTimeline, { progress });
}

function setScrollContainerHeight(scrollContainer: HTMLElement, name: HTMLElement, role: HTMLElement) {
  scrollContainer.style.height = `${window.innerHeight + getIntroductionScrollDuration() + getMaskOpenScrollDuration()}px`;
}

function getCharacterTimeline(element: Element): gsap.core.Timeline {
  const timeline = gsap.timeline({ paused: true });
  timeline.from(element, { x: getRandomNumber(-window.innerWidth / 4, window.innerWidth / 4), y: getRandomNumber(-window.innerHeight / 4, window.innerHeight / 4), rotate: getRandomNumber(-45, 45), scale: getRandomNumber(0.5, 2.5), duration: 1, ease: 'back.inOut' });
  return timeline;
}

function updateCharacterTimelineProgress(character: Character, scrollDistance: number) {
  const characterTimelineProgress = gsap.utils.normalize(character.left, character.left + character.width, scrollDistance);
  gsap.to(character.timeline, { progress: characterTimelineProgress, duration: 1, ease: 'none' });
}

if (text) {
  const characterElements = [...text.children].map((child) => splitText(child as HTMLElement)).reduce((previous, current) => previous.concat(current));
  characterElements.forEach((characterElement) => {
    const { left, width } = characterElement.getBoundingClientRect();
    characters.push({
      element: characterElement,
      left,
      width,
      timeline: getCharacterTimeline(characterElement),
    });
  });
}

document.body.addEventListener('scroll', () => {
  const scrollDistance = document.body.scrollTop;
  characters.forEach((character) => updateCharacterTimelineProgress(character, scrollDistance))
  updateMaskedContainerTimelineProgress(maskedContainerTimeline, scrollDistance);
})

let timeoutId: NodeJS.Timeout | null = null;

window.addEventListener('resize', () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    document.body.scrollTop = 0;
    if (scrollContainer && name && role) setScrollContainerHeight(scrollContainer, name, role);
    if (maskedContainer && maskStartPosition) {
      maskedContainerTimeline = getMaskedContainerTimeline(maskedContainer, getMaskedContentClipPath(maskStartPosition, 'beginning'), getMaskedContentClipPath(maskStartPosition, 'end'));
    }
    characters.forEach((character) => {
      const { left, width } = character.element.getBoundingClientRect();
      character.left = left;
      character.width = width;
      character.timeline.progress(0);
    });
    timeoutId = null;
  }, 300)
});

if (scrollContainer && name && role) setScrollContainerHeight(scrollContainer, name, role);

if (maskedContainer && maskStartPosition) {
  maskedContainerTimeline = getMaskedContainerTimeline(maskedContainer, getMaskedContentClipPath(maskStartPosition, 'beginning'), getMaskedContentClipPath(maskStartPosition, 'end'));

}

export {};
