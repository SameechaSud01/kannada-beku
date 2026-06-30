import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { type RetroflexRow } from '../../constants/guide';
import { StepHeading } from './StepHeading';
import { GuidePhonemeButton } from './GuidePhonemeButton';
import { MouthDiagram } from './MouthDiagram';

/**
 * Step 4 — "Curl your tongue back" (retroflex). A side-by-side mouth-position
 * contrast (curled retroflex vs. tongue-at-teeth dental) heroes the concept,
 * then Capital-vs-lowercase audio comparison rows: tap to hear the curled
 * retroflex against the dental sound (spec_lesson0_redesign.md).
 */
export function StepRetroflex({ rows }: { rows: RetroflexRow[] }) {
  return (
    <View>
      <StepHeading
        eyebrow="Retroflex"
        title="Curl your tongue back"
        subtitle="A Capital letter means curl your tongue up and back — a fuller, hollow sound."
      />

      {/* Visual contrast: where the tongue sits for a curled vs. a teeth sound. */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: moderateScale(20),
          marginBottom: Spacing.lg,
        }}
      >
        <MouthDiagram
          id="na"
          height={moderateScale(150)}
          label="Curled"
          caption="Tongue tip up and back"
          tint={Colors.errorContainerLow}
        />
        <MouthDiagram
          id="ta"
          height={moderateScale(150)}
          label="Teeth"
          caption="Tongue tip at the teeth"
        />
      </View>

      <View style={{ gap: Spacing.md }}>
        {rows.map((row) => (
          <View
            key={row.curled.transliteration}
            style={{ flexDirection: 'row', gap: moderateScale(11) }}
          >
            <GuidePhonemeButton
              kannada={row.curled.kannada}
              romanization={row.curled.transliteration}
              note="curled"
              accent="red"
            />
            <GuidePhonemeButton
              kannada={row.dental.kannada}
              romanization={row.dental.transliteration}
              note="teeth"
            />
          </View>
        ))}
      </View>
    </View>
  );
}
