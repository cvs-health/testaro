import {
  AuditStandards,
  IAuditRule,
  EssentialVersion
} from '../../interfaces/audit-rule.interface';
import { $accessibilityAuditRules, $severity, IssueCategory } from '../accessibility';

export const bestPractice: Partial<Record<$accessibilityAuditRules, IAuditRule>> = {
  /**
   * The description of all rules is generated automatically based on 'audit_accessibility_rule_description_' + rule where "rule" is a rule Id.
   * The title of all rules is generated automatically based on 'audit_accessibility_rule_title_' + rule where "rule" is a rule Id.
   */

  [$accessibilityAuditRules.aria_role_dialog]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.aria_role_dialog,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.aria_hidden_false]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.aria_hidden_false,
    severity: $severity.low,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.aria_hidden_false]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.aria_hidden_false,
    severity: $severity.low,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.capital_letters_words]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.capital_letters_words,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.content_editable_missing_attributes]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.content_editable_missing_attributes,
    severity: $severity.low,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.contentinfo_landmark_only_one]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.contentinfo_landmark_only_one,
    severity: $severity.low,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.elements_not_allowed_in_head]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.elements_not_allowed_in_head,
    severity: $severity.low,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.empty_title_attribute]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.empty_title_attribute,
    severity: $severity.low,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.flash_content]: {
    categories: [IssueCategory.embedded_objects],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.flash_content,
    severity: $severity.critical,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.font_style_italic]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.font_style_italic,
    severity: $severity.info,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.h1_must_be]: {
    categories: [IssueCategory.headings],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.h1_must_be,
    severity: $severity.critical,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.h1_only_one]: {
    categories: [IssueCategory.headings],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.h1_only_one,
    severity: $severity.critical,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.hidden_content]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.hidden_content,
    severity: $severity.info,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.horizontal_rule]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.horizontal_rule,
    severity: $severity.info,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.incorrect_technique_for_hiding_content]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.incorrect_technique_for_hiding_content,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.invalid_attribute_dir_value]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.invalid_attribute_dir_value,
    severity: $severity.critical,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.label_duplicated_content_title]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.label_duplicated_content_title,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.links_language_destination]: {
    categories: [IssueCategory.links],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.links_language_destination,
    severity: $severity.info,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.links_same_content_different_url]: {
    categories: [IssueCategory.links],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.links_same_content_different_url,
    severity: $severity.info,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.main_element_only_one]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.main_element_only_one,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.main_landmark_must_be_top_level]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.main_landmark_must_be_top_level,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.minimum_font_size]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.minimum_font_size,
    severity: $severity.info,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.missing_href_on_a]: {
    categories: [IssueCategory.links],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.missing_href_on_a,
    severity: $severity.critical,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.misused_aria_on_focusable_element]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.misused_aria_on_focusable_element,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.misused_input_attribute]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.misused_input_attribute,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.misused_required_attribute]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.misused_required_attribute,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.navigation_landmark_restrictions]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.navigation_landmark_restrictions,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.obsolete_html_attributes]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.obsolete_html_attributes,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.obsolete_html_elements]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.obsolete_html_elements,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.outline_zero]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.outline_zero,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.overlay]: {
    categories: [IssueCategory.robust],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.overlay,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.role_application]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.role_application,
    severity: $severity.critical,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.rtl_content]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.rtl_content,
    severity: $severity.info,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.unclear_anchor_uri]: {
    categories: [IssueCategory.links],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.unclear_anchor_uri,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.unsupported_aria_on_element]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.unsupported_aria_on_element,
    severity: $severity.low,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  },
  [$accessibilityAuditRules.unsupported_role_on_element]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.unsupported_role_on_element,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.essential,
        url: '',
        [AuditStandards.essential]: {
          version: EssentialVersion.v10
        }
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.essential
    }],
    title: ''
  }
};
