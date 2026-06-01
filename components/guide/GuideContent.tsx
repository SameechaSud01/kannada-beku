import { View } from 'react-native';
import { GUIDE_SECTIONS } from '../../constants/guide';
import { GuideSection } from './GuideSection';
import { GlyphCard } from './GlyphCard';
import { RuleCard } from './RuleCard';
import { KeyRow } from './KeyRow';

/**
 * Shared body rendered by both /onboarding/basics and /guide.
 * Header (title/subtitle), ProgressDots, and the sticky CTA are owned by
 * each parent screen — this component renders the sections list only.
 */
export function GuideContent() {
  return (
    <View>
      {GUIDE_SECTIONS.map((section) => {
        const isKeySection = section.slug === 'pronunciation-key';
        return (
          <GuideSection key={section.slug} title={section.title} subtitle={section.subtitle}>
            {isKeySection ? (
              <View>
                {section.items.map((item, idx) => {
                  if (item.kind !== 'key') return null;
                  return <KeyRow key={`${item.symbol}-${idx}`} symbol={item.symbol} example={item.example} />;
                })}
              </View>
            ) : (
              section.items.map((item, idx) => {
                if (item.kind === 'glyph') {
                  return (
                    <GlyphCard
                      key={`${section.slug}-${item.kannada}-${idx}`}
                      kannada={item.kannada}
                      transliteration={item.transliteration}
                      example={item.example}
                    />
                  );
                }
                if (item.kind === 'rule') {
                  return (
                    <RuleCard
                      key={`${section.slug}-${item.ruleKind}`}
                      title={item.title}
                      description={item.description}
                      examples={item.examples}
                    />
                  );
                }
                return null;
              })
            )}
          </GuideSection>
        );
      })}
    </View>
  );
}
