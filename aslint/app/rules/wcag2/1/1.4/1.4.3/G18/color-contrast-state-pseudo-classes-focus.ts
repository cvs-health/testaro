import { $accessibilityAuditRules } from '../../../../../../constants/accessibility';
import { ColorContrastStatePseudoClassesAbstract } from './color-contrast-state-pseudo-classes-abstract';

export class ColorContrastStatePseudoClassesFocus extends ColorContrastStatePseudoClassesAbstract {

  constructor() {
    super($accessibilityAuditRules.color_contrast_state_pseudo_classes_focus);
  }

}
