import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import type { Lesson } from '../../constants/lessons/types';
import { LipButton } from '../ui/LipButton';
import { DoneNode, NextCard, UpcomingNode, Connector, numberWord } from './LessonTrail';

interface PartDoneCardProps {
  lesson: Lesson;
  /** Index of the just-finished section in `lesson.sections`. */
  partIndex: number;
  /** Start the next section. */
  onContinue: () => void;
  /** Back to the part chooser. */
  onBack: () => void;
  /** Exit to the home tab. */
  onHome: () => void;
}

const sectionItemsLabel = (s: Lesson['sections'][number]): string => {
  const items: string[] = [];
  if (s.words.length) items.push(`${s.words.length} ${s.words.length === 1 ? 'word' : 'words'}`);
  if (s.phrases.length)
    items.push(`${s.phrases.length} ${s.phrases.length === 1 ? 'phrase' : 'phrases'}`);
  return items.join(' · ');
};

/**
 * End-of-sub-part "where you are" screen for non-final parts: a vertical trail of
 * the lesson's sections — earlier parts done, the just-finished part highlighted,
 * the next part as a tappable "up next" card, and any parts still ahead shown
 * faint/locked. Orientation, not applause. The full lesson celebration + server
 * completion only happens after the last part (DoneCard).
 */
export function PartDoneCard({
  lesson,
  partIndex,
  onContinue,
  onBack,
  onHome,
}: PartDoneCardProps) {
  const insets = useSafeAreaInsets();

  const sections = lesson.sections;
  const total = sections.length;
  const current = sections[partIndex];
  const nextSection = sections[partIndex + 1];
  const remaining = total - (partIndex + 1);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.xl,
          paddingTop: insets.top + Spacing.xxl,
          paddingBottom: Spacing.xl,
        }}
      >
        {/* ---- Header: orientation, not applause ---- */}
        <View>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: Colors.textFaint,
            }}
            maxFontSizeMultiplier={1.2}
          >
            {`Part ${current.key} · ${current.label} — done`}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(27),
              color: Colors.onSurface,
              letterSpacing: -0.4,
              lineHeight: moderateScale(37),
              marginTop: moderateScale(10),
            }}
            maxFontSizeMultiplier={1.2}
          >
            {`That's ${numberWord(partIndex + 1)} of ${numberWord(total)}.`}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(14.5),
              lineHeight: moderateScale(21),
              color: Colors.tertiary,
              marginTop: moderateScale(12),
            }}
            maxFontSizeMultiplier={1.3}
          >
            <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
              {nextSection.label}
            </Text>
            {` is next — ${numberWord(remaining)} ${remaining === 1 ? 'part' : 'parts'} to go.`}
          </Text>
        </View>

        {/* ---- Trail: where you are ---- */}
        <View style={{ marginTop: moderateScale(34) }}>
          {sections.slice(0, partIndex).map((s) => (
            <View key={s.key}>
              <DoneNode title={s.label} subtitle={`Part ${s.key} · done`} />
              <Connector filled />
            </View>
          ))}

          <DoneNode
            title={current.label}
            subtitle={`Just finished · Part ${current.key}`}
            highlight
          />

          <Connector />
          <NextCard
            title={nextSection.label}
            subtitle={sectionItemsLabel(nextSection) || `Part ${nextSection.key}`}
            onPress={onContinue}
          />

          {sections.slice(partIndex + 2).map((s) => (
            <View key={s.key}>
              <Connector />
              <UpcomingNode
                title={s.label}
                subtitle={sectionItemsLabel(s) || `Part ${s.key}`}
              />
            </View>
          ))}
        </View>

        <View style={{ flex: 1, minHeight: moderateScale(24) }} />

        {/* ---- Secondary actions (primary continue is the Up-next card) ---- */}
        <View
          style={{
            flexDirection: 'row',
            gap: Spacing.md,
            paddingBottom: insets.bottom + moderateScale(8),
          }}
        >
          <View style={{ flex: 1 }}>
            <LipButton
              label="Back to parts"
              onPress={onBack}
              accessibilityLabel="Back to parts"
              variant="secondary"
              icon={Icons.back}
              iconLeading
            />
          </View>
          <View style={{ flex: 1 }}>
            <LipButton
              label="Home"
              onPress={onHome}
              accessibilityLabel="Go to home"
              variant="secondary"
              icon={Icons.tabHome}
              iconLeading
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
