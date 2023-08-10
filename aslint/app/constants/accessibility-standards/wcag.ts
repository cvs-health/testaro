import { Wcag } from '../wcag';
import { AuditStandards, IAuditRule } from '../../interfaces/audit-rule.interface';
import { $accessibilityAuditRules, $severity, IssueCategory } from '../accessibility';

export const wcag: Partial<Record<$accessibilityAuditRules, IAuditRule>> = {
  /**
   * The description of all rules is generated automatically based on 'audit_accessibility_rule_description_' + rule where "rule" is a rule Id.
   * The title of all rules is generated automatically based on 'audit_accessibility_rule_title_' + rule where "rule" is a rule Id.
   */

  [$accessibilityAuditRules.accessible_svg]: {
    categories: [IssueCategory.images],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [{
      content: 'Understanding Success Criterion 1.1.1: Non-text Content',
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html'
    }],
    ruleId: $accessibilityAuditRules.accessible_svg,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [
      {
        id: 'TECH:ARIA6',
        link: 'https://www.w3.org/TR/WCAG20-TECHS/ARIA6.html',
        standard: AuditStandards.wcag
      },
      {
        id: 'TECH:ARIA10',
        link: 'https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA10',
        standard: AuditStandards.wcag
      }
    ],
    title: ''
  },
  [$accessibilityAuditRules.orientation]: {
    categories: [IssueCategory.adaptable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [{
      content: 'Understanding Success Criterion 1.3.4: Orientation',
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/orientation.html'
    }],
    ruleId: $accessibilityAuditRules.orientation,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.4: Orientation',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/orientation.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.4')
      }
    ],
    techniques: [],
    title: ''
  },
  [$accessibilityAuditRules.css_images_convey_information]: {
    categories: [IssueCategory.images],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [{
      content: 'Understanding Success Criterion 1.1.1: Non-text Content',
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html'
    }],
    ruleId: $accessibilityAuditRules.css_images_convey_information,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [
      {
        id: 'TECH:ARIA6',
        link: 'https://www.w3.org/TR/WCAG20-TECHS/ARIA6.html',
        standard: AuditStandards.wcag
      }
    ],
    title: ''
  },
  [$accessibilityAuditRules.missing_alt_attribute]: {
    categories: [IssueCategory.images],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [{
      content: 'Understanding Success Criterion 1.1.1: Non-text Content',
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html'
    }],
    ruleId: $accessibilityAuditRules.missing_alt_attribute,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [
      {
        id: 'TECH:H36',
        link: 'https://www.w3.org/WAI/WCAG21/Techniques/html/H36.html',
        standard: AuditStandards.wcag
      }
    ],
    title: ''
  },
  [$accessibilityAuditRules.captcha_google]: {
    categories: [IssueCategory.captcha],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.captcha_google,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [
      {
        id: 'TECH:G143',
        link: 'https://www.w3.org/TR/WCAG20-TECHS/G143.html',
        standard: AuditStandards.wcag
      }
    ],
    title: ''
  },
  [$accessibilityAuditRules.img_empty_alt_in_link]: {
    categories: [IssueCategory.images, IssueCategory.links],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.img_empty_alt_in_link,
    severity: $severity.critical,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.area_missing_alt]: {
    categories: [IssueCategory.images],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.area_missing_alt,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.applet_missing_alt]: {
    categories: [IssueCategory.embedded_objects],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.applet_missing_alt,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.applet_missing_body]: {
    categories: [IssueCategory.embedded_objects],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.applet_missing_body,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.input_image_missing_alt]: {
    categories: [IssueCategory.images, IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.input_image_missing_alt,
    severity: $severity.critical,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.general_alt]: {
    categories: [IssueCategory.images],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.general_alt,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.object_general_alt]: {
    categories: [IssueCategory.embedded_objects],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.object_general_alt,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.object_missing_body]: {
    categories: [IssueCategory.embedded_objects],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.object_missing_body,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.identify_input_purpose]: {
    categories: [IssueCategory.images],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.identify_input_purpose,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.img_empty_alt_with_empty_title]: {
    categories: [IssueCategory.images],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.img_empty_alt_with_empty_title,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.audio_alternative]: {
    categories: [IssueCategory.audio],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.audio_alternative,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 1.2.1: Audio-only and Video-only (Prerecorded)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.2.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.audio_video_captions]: {
    categories: [IssueCategory.audio],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.audio_video_captions,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.2.1: Audio-only and Video-only (Prerecorded)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.2.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.video_audio_descriptions]: {
    categories: [IssueCategory.audio],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.video_audio_descriptions,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.2.1: Audio-only and Video-only (Prerecorded)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.2.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.aria_describedby_association]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.aria_describedby_association,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.headings_hierarchy]: {
    categories: [IssueCategory.headings],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.headings_hierarchy,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.table_caption_summary_identical]: {
    categories: [IssueCategory.tables],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.table_caption_summary_identical,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.table_missing_description]: {
    categories: [IssueCategory.tables],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.table_missing_description,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.empty_label_element]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.empty_label_element,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.incorrect_label_placement]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.incorrect_label_placement,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.label_implicitly_associated]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.label_implicitly_associated,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.label_inappropriate_association]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.label_inappropriate_association,
    severity: $severity.critical,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.table_row_and_column_headers]: {
    categories: [IssueCategory.tables],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.table_row_and_column_headers,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.fieldset_no_legend]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.fieldset_no_legend,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.group_elements_name_attribute]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.group_elements_name_attribute,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.duplicated_for_attribute]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.duplicated_for_attribute,
    severity: $severity.critical,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.1: Info and Relationships',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.meaningful_content_sequence]: {
    categories: [IssueCategory.perceivable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.meaningful_content_sequence,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 1.3.2: Meaningful Sequence',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/meaningful-sequence.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.3.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.alt_color_convey_information]: {
    categories: [IssueCategory.images],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.alt_color_convey_information,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      },
      {
        description: 'Understanding Success Criterion 1.4.1: Use of Color',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.text_color_convey_information]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.text_color_convey_information,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      },
      {
        description: 'Understanding Success Criterion 1.4.1: Use of Color',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.broken_same_page_link]: {
    categories: [IssueCategory.operable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.broken_same_page_link,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 2.1.1: Keyboard',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.color_contrast_aa]: {
    categories: [IssueCategory.perceivable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [
      {
        content: 'Understanding Success Criterion 1.4.3: Contrast (Minimum)',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html'
      }
    ],
    ruleId: $accessibilityAuditRules.color_contrast_aa,
    severity: $severity.critical,
    standards: [
      {
        description: 'Understanding Success Criterion 1.4.3: Contrast (Minimum)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.3')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.color_contrast_state_pseudo_classes_active]: {
    categories: [IssueCategory.perceivable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: false,
    resources: [
      {
        content: 'Understanding Success Criterion 1.4.3: Contrast (Minimum)',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html'
      }
    ],
    ruleId: $accessibilityAuditRules.color_contrast_state_pseudo_classes_active,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 1.4.3: Contrast (Minimum)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.3')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.color_contrast_state_pseudo_classes_focus]: {
    categories: [IssueCategory.perceivable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: false,
    resources: [
      {
        content: 'Understanding Success Criterion 1.4.3: Contrast (Minimum)',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html'
      }
    ],
    ruleId: $accessibilityAuditRules.color_contrast_state_pseudo_classes_focus,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 1.4.3: Contrast (Minimum)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.3')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.color_contrast_state_pseudo_classes_hover]: {
    categories: [IssueCategory.perceivable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: false,
    resources: [
      {
        content: 'Understanding Success Criterion 1.4.3: Contrast (Minimum)',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html'
      }
    ],
    ruleId: $accessibilityAuditRules.color_contrast_state_pseudo_classes_hover,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 1.4.3: Contrast (Minimum)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.3')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.empty_button_description]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.empty_button_description,
    severity: $severity.high,
    standards: [
      {
        description: '4.1.2 Name, Role, Value (Level A)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/TR/WCAG21/#name-role-value',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('4.1.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.empty_link_element]: {
    categories: [IssueCategory.links],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.empty_link_element,
    severity: $severity.high,
    standards: [
      {
        description: '2.4.4 Link Purpose (In Context) (Level A)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/TR/2008/REC-WCAG20-20081211/#navigation-mechanisms-refs',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.6')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.headings_sibling_unique]: {
    categories: [IssueCategory.headings],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.headings_sibling_unique,
    severity: $severity.low,
    standards: [
      {
        description: '2.4.6 Headings and Labels (Level AA, Primary Success Criterion)',
        id: AuditStandards.wcag,
        url: 'http://www.w3.org/TR/WCAG20/#navigation-mechanisms-descriptive',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.6')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.zoom_disabled]: {
    categories: [IssueCategory.perceivable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.zoom_disabled,
    severity: $severity.critical,
    standards: [
      {
        description: 'Understanding Success Criterion 1.4.4: Resize text',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.4')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.color_contrast_aaa]: {
    categories: [IssueCategory.perceivable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.color_contrast_aaa,
    severity: $severity.critical,
    standards: [
      {
        description: 'Understanding Success Criterion 1.4.6: Contrast (Enhanced)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.6')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.link_button_space_key]: {
    categories: [IssueCategory.links],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.link_button_space_key,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 2.1.1: Keyboard',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.no_meta_http_equiv_refresh]: {
    categories: [IssueCategory.operable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.no_meta_http_equiv_refresh,
    severity: $severity.critical,
    standards: [
      {
        description: 'Understanding Success Criterion 2.2.1: Timing Adjustable',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/timing-adjustable.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.2.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.autoplay_audio_video]: {
    categories: [IssueCategory.audio, IssueCategory.videos],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.autoplay_audio_video,
    severity: $severity.critical,
    standards: [
      {
        description: 'Understanding Success Criterion 1.4.2: Audio Control',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.2')
      },
      {
        description: 'Understanding Success Criterion 2.2.2: Pause, Stop, Hide',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.2.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.animation]: {
    categories: [IssueCategory.operable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.animation,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 2.2.2: Pause, Stop, Hide',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.2.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.blink_element]: {
    categories: [IssueCategory.operable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.blink_element,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 2.2.2: Pause, Stop, Hide',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.2.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.flickering]: {
    categories: [IssueCategory.operable],
    description: 'Check that the page do not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds.',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.flickering,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 2.3.1: Three Flashes or Below Threshold',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/three-flashes-or-below-threshold.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.3.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.page_title]: {
    categories: [IssueCategory.operable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.page_title,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 2.4.2: Page Titled',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.misused_tabindex_attribute]: {
    categories: [IssueCategory.operable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.misused_tabindex_attribute,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 2.4.3: Focus Order',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.3')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.positive_tabindex]: {
    categories: [IssueCategory.operable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.positive_tabindex,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 2.4.3: Focus Order',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.3')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.aria_labelledby_association]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.aria_labelledby_association,
    severity: $severity.critical,
    standards: [
      {
        description: 'Understanding Success Criterion 2.4.4: Link Purpose (In Context)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.4')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.aria_labelledby_association_empty_element]: {
    categories: [IssueCategory.aria],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.aria_labelledby_association_empty_element,
    severity: $severity.critical,
    standards: [
      {
        description: 'Understanding Success Criterion 2.4.4: Link Purpose (In Context)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.4')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.click_verb]: {
    categories: [IssueCategory.operable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.click_verb,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 2.4.4: Link Purpose (In Context)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.4')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.empty_heading]: {
    categories: [IssueCategory.headings],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.empty_heading,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 2.4.6: Headings and Labels',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.6')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.no_headings]: {
    categories: [IssueCategory.headings],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.no_headings,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 2.4.10: Section Headings',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/section-headings.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.10')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.html_lang_attr]: {
    categories: [IssueCategory.understandable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.html_lang_attr,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 3.1.1: Language of Page',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('3.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.title_for_abbr]: {
    categories: [IssueCategory.understandable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.title_for_abbr,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 3.1.4: Abbreviations',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/abbreviations.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('3.1.4')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.missing_submit_button]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.missing_submit_button,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 3.2.2: On Input',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/on-input.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('3.2.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.links_new_window_mark]: {
    categories: [IssueCategory.links],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.links_new_window_mark,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 3.2.5: Change on Request',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/change-on-request.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('3.2.5')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.link_with_unclear_purpose]: {
    categories: [IssueCategory.links],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.link_with_unclear_purpose,
    severity: $severity.high,
    standards: [
      {
        description: '',
        id: AuditStandards.wcag,
        url: '',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.9')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.label_visually_hidden_only]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.label_visually_hidden_only,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 3.3.2: Labels or Instructions',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('3.3.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.missing_label]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.missing_label,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 3.3.2: Labels or Instructions',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('3.3.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.motion_actuation]: {
    categories: [IssueCategory.operable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.motion_actuation,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 2.5.4: Motion Actuation',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/motion-actuation.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.5.4')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.legend_first_child_of_fieldset]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.legend_first_child_of_fieldset,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 3.3.2: Labels or Instructions',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('3.3.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.duplicated_id_attribute]: {
    categories: [IssueCategory.robust],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.duplicated_id_attribute,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 4.1.1: Parsing',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/parsing.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('4.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.title_iframe]: {
    categories: [IssueCategory.embedded_objects],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.title_iframe,
    severity: $severity.high,
    standards: [
      {
        description: 'Understanding Success Criterion 4.1.2: Name, Role, Value',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('4.1.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.select_initial_option]: {
    categories: [IssueCategory.forms],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.select_initial_option,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 4.1.2: Name, Role, Value',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('4.1.2')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.img_adjacent_duplicate_text_link]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.img_adjacent_duplicate_text_link,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      },
      {
        description: 'Understanding Success Criterion 2.4.4: Link Purpose (In Context)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.4')
      },
      {
        description: 'Understanding Success Criterion 2.4.9: Link Purpose (Link Only)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-link-only.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.9')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.alt_text_include_filename]: {
    categories: [IssueCategory.images],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.alt_text_include_filename,
    severity: $severity.high,
    standards: [
      {
        description: 'F30: Failure of Success Criterion 1.1.1 and 1.2.1 due to using text alternatives that are not alternatives (e.g., filenames or placeholder text)',
        id: AuditStandards.wcag,
        url: 'http://www.w3.org/TR/WCAG20-TECHS/F30',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.links_not_visually_evident_without_color_vision]: {
    categories: [IssueCategory.links],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.links_not_visually_evident_without_color_vision,
    severity: $severity.high,
    standards: [
      {
        description: 'Failure of Success Criterion 1.4.1 due to creating links that are not visually evident without color vision',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Techniques/failures/F73',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.1')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.img_alt_duplicate_text_link]: {
    categories: [IssueCategory.uncategorized],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.img_alt_duplicate_text_link,
    severity: $severity.low,
    standards: [
      {
        description: 'Understanding Success Criterion 1.1.1: Non-text Content',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.1.1')
      },
      {
        description: 'Understanding Success Criterion 2.4.4: Link Purpose (In Context)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.4')
      },
      {
        description: 'Understanding Success Criterion 2.4.9: Link Purpose (Link Only)',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-link-only.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('2.4.9')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  // WCAG 2.1
  [$accessibilityAuditRules.position_sticky]: {
    categories: [IssueCategory.perceivable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.position_sticky,
    severity: $severity.low,
    standards: [
      {
        description: 'Success Criterion 1.4.8 Visual Presentation',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-visual-presentation.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.10')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  },
  [$accessibilityAuditRules.reflow]: {
    categories: [IssueCategory.distinguishable],
    description: '',
    isMarkedAsFalsePositive: false,
    isSelectedForScanning: true,
    resources: [],
    ruleId: $accessibilityAuditRules.reflow,
    severity: $severity.info,
    standards: [
      {
        description: 'Understanding Success Criterion 1.4.10: Reflow',
        id: AuditStandards.wcag,
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/reflow.html',
        [AuditStandards.wcag]: Wcag.getSuccessCriteria('1.4.10')
      }
    ],
    techniques: [{
      id: '', link: '', standard: AuditStandards.wcag
    }],
    title: ''
  }
};
