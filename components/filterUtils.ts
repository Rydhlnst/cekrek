
export const getFilterClassForVideo = (selectedFilterValue: string): string => {
  switch (selectedFilterValue) {
    case "grayscale": return "grayscale";
    case "sepia": return "sepia";
    case "bright": return "brightness-125";
    case "contrast": return "contrast-150";
    case "warm": return "hue-rotate-[-15deg] saturate-150"; // Adjusted for typical warm effect
    case "cool": return "hue-rotate-[15deg] saturate-150";  // Adjusted for typical cool effect
    case "blur": return "blur-sm";
    case "invert": return "invert";
    case "mono": return "grayscale contrast-125";
    case "vivid": return "saturate-200 contrast-125";
    default: return "";
  }
};

export const getCanvasFilterFromSelection = (selectedFilterValue: string): string => {
  // Note: Canvas filters can differ slightly from CSS filters. Adjust values as needed.
  switch (selectedFilterValue) {
    case "grayscale": return "grayscale(1)";
    case "sepia": return "sepia(1)";
    case "bright": return "brightness(1.25)";
    case "contrast": return "contrast(1.5)";
    case "warm": return "hue-rotate(-15deg) saturate(1.5)";
    case "cool": return "hue-rotate(15deg) saturate(1.5)";
    case "blur": return "blur(2px)"; // blur-sm is often 4px, but 2px might be less intense for capture
    case "invert": return "invert(1)";
    case "mono": return "grayscale(1) contrast(1.25)";
    case "vivid": return "saturate(2) contrast(1.25)";
    default: return "none";
  }
};