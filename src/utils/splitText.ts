export function splitText(element: HTMLElement) {
  element.innerHTML = element.innerHTML.split("")
    .map((character) => {
      return character === " "
        ? " "
        : `<span class='split-character'>${character}</span>`;
    })
    .join("");
  return [...element.getElementsByClassName('split-character')];
}
