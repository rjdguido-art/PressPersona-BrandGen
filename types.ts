export interface LogoConcept {
  id: string;
  title: string;
  rationale: string;
  colorPalette: string[];
  typographySuggestion: string;
  imagePrompt: string;
  imageUrl?: string; // Populated after image generation
  isLoadingImage?: boolean;
}

export interface FormData {
  companyName: string;
  description: string;
  industry: string;
}
