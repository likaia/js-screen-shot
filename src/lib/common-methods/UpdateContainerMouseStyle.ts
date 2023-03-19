export function updateContainerMouseStyle(
  container: HTMLCanvasElement,
  toolName: string
) {
  switch (toolName) {
    case "text":
      container.style.cursor = "text";
      break;
    default:
      container.style.cursor = "default";
      break;
  }
}
