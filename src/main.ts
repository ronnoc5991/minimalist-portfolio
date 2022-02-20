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
let maskedContainerInitialClipPath: string;
let maskedContainerEndClipPath: string;
let characters: Array<Character> = [];
let maskedContainerTimeline: gsap.core.Timeline;

function setMaskedContentInitialClipPath(maskedContainer: HTMLElement, maskStartPosition: HTMLElement) {
  const { top, left, width, height } = maskStartPosition.getBoundingClientRect();
  maskedContainerInitialClipPath = `inset(${top}px ${window.innerWidth - (left + width)}px ${window.innerHeight - (top + height)}px ${left}px round ${Math.max(window.innerHeight, window.innerWidth)}px)`;
}

function setMaskedContentEndClipPath(maskedContainer: HTMLElement, maskStartPosition: HTMLElement) {
  const { top, left, width, height } = maskStartPosition.getBoundingClientRect();
  const viewportMaximum = Math.max(window.innerWidth, window.innerHeight);
  maskedContainerEndClipPath = `inset(${top - viewportMaximum * 2}px ${window.innerWidth - (left + width) - viewportMaximum * 2}px ${window.innerHeight - (top + height) - viewportMaximum * 2}px ${left - viewportMaximum * 2}px round ${viewportMaximum}px)`;
}

function getMaskedContainerTimeline(maskedContainer: HTMLElement): gsap.core.Timeline {
  const timeline = gsap.timeline({ paused: true });
  timeline.fromTo(maskedContainer, { clipPath: maskedContainerInitialClipPath }, { clipPath: maskedContainerEndClipPath, duration: 1, ease: 'sine.in' });
  return timeline;
}

function updateMaskedContainerTimelineProgress(maskedContainerTimeline: gsap.core.Timeline, scrollDistance: number) {
  if (!name || !role) return;
  const progress = gsap.utils.normalize(name.offsetWidth + role.offsetWidth,  name.offsetWidth + role.offsetWidth + window.innerHeight, scrollDistance);
  gsap.set(maskedContainerTimeline, { progress });
}

function setScrollContainerHeight(scrollContainer: HTMLElement, name: HTMLElement, role: HTMLElement) {
  scrollContainer.style.height = `${window.innerHeight * 2 + name.offsetWidth + role.offsetWidth}px`;
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
      setMaskedContentInitialClipPath(maskedContainer, maskStartPosition);
      setMaskedContentEndClipPath(maskedContainer, maskStartPosition);
      maskedContainerTimeline = getMaskedContainerTimeline(maskedContainer);
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
  setMaskedContentInitialClipPath(maskedContainer, maskStartPosition);
  setMaskedContentEndClipPath(maskedContainer, maskStartPosition);
  maskedContainerTimeline = getMaskedContainerTimeline(maskedContainer);
}

export {};
