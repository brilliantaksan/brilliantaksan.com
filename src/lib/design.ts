import designData from '../../content/design.json';

interface TypeScaleToken {
  size: string;
  scale?: number;
  lineHeight: number;
  letterSpacing: string;
}

interface DesignTokens {
  layout: {
    maxWidthPx: number;
    sectionGapPx: number;
  };
  spacing: {
    heroStackPx: number;
    sectionStackPx: number;
  };
  typography: {
    globalScale?: number;
    globalLineHeight?: number;
    location: TypeScaleToken;
    heroTitle: TypeScaleToken;
    heroLead: TypeScaleToken;
    body: TypeScaleToken;
    sectionTitle: TypeScaleToken;
    showcaseTitle: TypeScaleToken;
    showcaseBody: TypeScaleToken;
    cardTitle: TypeScaleToken;
    meta: TypeScaleToken;
    pill: TypeScaleToken;
  };
}

export const designTokens = designData as DesignTokens;
