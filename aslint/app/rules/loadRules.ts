import { AbstractRule } from './abstract-rule';

import { AriaHiddenFalse } from './aslint/aria-hidden-false/aria-hidden-false';
import { EmptyLabelElement } from './wcag2/1/1.3/1.3.1/H44/empty-label-element';
import { ColorContrastA2 } from './wcag2/1/1.4/1.4.3/G18/color-contrast-aa';
import { ColorContrastStatePseudoClassesActive } from './wcag2/1/1.4/1.4.3/G18/color-contrast-state-pseudo-classes-active';
import { ColorContrastStatePseudoClassesFocus } from './wcag2/1/1.4/1.4.3/G18/color-contrast-state-pseudo-classes-focus';
import { ColorContrastStatePseudoClassesHover } from './wcag2/1/1.4/1.4.3/G18/color-contrast-state-pseudo-classes-hover';
import { ColorContrastA3 } from './wcag2/1/1.4/1.4.6/G17/color-contrast-aaa';
import { CapitalLettersWords } from './aslint/capital-letters-words/capital-letters-words';
import { ContentEditableMissingAttributes } from './aslint/content-editable-missing-attributes/content-editable-missing-attributes';
import { ContentinfoLandmarkOnlyOne } from './aslint/contentinfo-landmark-only-one/contentinfo-landmark-only-one';
import { ElementsNotAllowed } from './aslint/elements-not-allowed-in-head/elements-not-allowed-in-head';
import { EmptyLinkElement } from './wcag2/2/2.4/2.4.4/H30/empty-link-element';
import { EmptyTitleAttribute } from './aslint/empty-title-attribute/empty-title-attribute';
import { FieldsetNoLegend } from './wcag2/1/1.3/1.3.1/H71/fieldset-no-legend';
import { FlashContent } from './aslint/flash-content/flash-content';
import { GroupElementsNameAttribute } from './wcag2/1/1.3/1.3.1/H71/group-elements-name-attribute';
import { H1MustBe } from './aslint/h1-must-be/h1-must-be';
import { HeadingsSiblingUnique } from './aslint/headings-sibling-unique/headings-sibling-unique';
import { HorizontalRule } from './aslint/horizontal-rule/horizontal-rule';
import { IncorrectTechniqueForHidingContent } from './aslint/incorrect-technique-for-hiding-content/incorrect-technique-for-hiding-content';
import { IncorrectLabelPlacement } from './wcag2/1/1.3/1.3.1/H44/incorrect-label-placement';
import { InvalidAttributeDirValue } from './aslint/invalid-attribute-dir-value/invalid-attribute-dir-value';
import { LabelDuplicatedContentTitle } from './aslint/label-duplicated-content-title/label-duplicated-content-title';
import { LabelImplicitlyAssociated } from './wcag2/1/1.3/1.3.1/H44/label-implicitly-associated';
import { LabelInappropriateAssociation } from './wcag2/1/1.3/1.3.1/H44/label-inappropriate-association';
import { LabelVisuallyHiddenOnly } from './wcag2/3/3.3/3.3.2/H44/label-visually-hidden-only';
import { LegendFirstChildOfFieldSet } from './wcag2/3/3.3/3.3.2/H71/legend-first-child-of-fieldset';
import { LinkButtonSpaceKey } from './wcag2/2/2.1/2.1.1/SCR35/link-button-space-key';
import { LinkWithUnclearPurpose } from './wcag2/2/2.4/2.4.9/F84/link-with-unclear-purpose/link-with-unclear-purpose';
import { LinksLanguageDestination } from './aslint/links-language-destination/links-language-destination';
import { LinksNewWindowMark } from './wcag2/3/3.2/3.2.5/G201/links-new-window-mark';
import { LinksSameContentDifferenceUrl } from './wcag2/2/2.4/2.4.4/H30/links-same-content-different-url';
import { MainElementOnlyOne } from './aslint/main-element-only-one/main-element-only-one';
import { MainLandmarkMustBeTopLevel } from './aslint/main-landmark-must-be-top-level/main-landmark-must-be-top-level';
import { MinimumFontSize } from './aslint/minimum-font-size/minimum-font-size';
import { MissingHrefOnA } from './aslint/missing-href-on-a/missing-href-on-a';
import { MissingLabel } from './wcag2/3/3.3/3.3.2/H44/missing-label';
import { MissingSubmitButton } from './wcag2/3/3.2/3.2.2/H32/missing-submit-button';
import { MisusedAriaOnFocusableElement } from './aslint/misused-aria-on-focusable-element/misused-aria-on-focusable-element';
import { MisusedInputAttribute } from './aslint/misused-input-attribute/misused-input-attribute';
import { MisusedRequiredAttribute } from './aslint/misused-required-attribute/misused-required-attribute';
import { MisusedTabindexAttribute } from './wcag2/2/2.4/2.4.3/H4/misused-tabindex-attribute';
import { NavigationLandmarkRestrictions } from './aslint/navigation-landmark-restrictions/navigation-landmark-restrictions';
import { NoMetaHttpEquivRefresh } from './wcag2/2/2.2/2.2.1/F41/no-meta-http-equiv-refresh';
import { ObsoleteHtmlAttributes } from './aslint/obsolete-html-attributes/obsolete-html-attributes';
import { ObsoleteHtmlElements } from './aslint/obsolete-html-elements/obsolete-html-elements';
import { OutlineZero } from './aslint/outline-zero/outline-zero';
import { PositiveTabindex } from './wcag2/2/2.4/2.4.3/H4/positive-tabindex';
import { RoleApplication } from './aslint/role-application/role-application';
import { RtlContent } from './aslint/rtl-content/rtl-content';
import { SelectInitialOption } from './wcag2/4/4.1/4.1.2/H91/select-initial-option';
import { TableMissingDescription } from './wcag2/1/1.3/1.3.1/H39/table-missing-description';
import { PageTitle } from './wcag2/2/2.4/2.4.2/H25/page-title';
import { TitleForAbbr } from './wcag2/3/3.1/3.1.4/H28/title-for-abbr';
import { UnclearAnchorUri } from './aslint/unclear-uri-on-a/unclear-anchor-uri';
import { UnsupportedRoleOnElement } from './aslint/unsupported-role-on-element/unsupported-role-on-element';
import { AppletMissingAlt } from './wcag2/1/1.1/1.1.1/H35/applet-missing-alt';
import { AppletMissingBody } from './wcag2/1/1.1/1.1.1/H35/applet-missing-body';
import { AudioAlternative } from './wcag2/1/1.2/1.2.1/G158/audio-alternative';
import { GeneralAlt } from './wcag2/1/1.1/1.1.1/H37/general-alt';
import { ImgEmptyAltInLink } from './wcag2/1/1.1/1.1.1/H30/img-empty-alt-in-link';
import { ImgEmptyAltWithEmptyTitle } from './wcag2/1/1.1/1.1.1/H67/img-empty-alt-with-empty-title';
import { ImgAdjacentDuplicateTextLink } from './wcag2/1/1.1/1.1.1/H2/img-adjacent-duplicate-text-link';
import { ImgAltDuplicateTextLink } from './wcag2/1/1.1/1.1.1/H2/img-alt-duplicate-text-link';
import { InputImageMissingAlt } from './wcag2/1/1.1/1.1.1/H36/input-image-missing-alt';
import { ObjectGeneralAlt } from './wcag2/1/1.1/1.1.1/H53/object-general-alt';
import { ObjectMissingBody } from './wcag2/1/1.1/1.1.1/H53/object-missing-body';
import { AudioVideoCaptions } from './wcag2/1/1.2/1.2.1/H95/audio-video-captions';
import { VideoAudioDescriptions } from './wcag2/1/1.2/1.2.1/H96/video-audio-descriptions';
import { MeaningfulContentSequence } from './wcag2/1/1.3/1.3.2/G57/meaningful-content-sequence';
import { TableRowAndColumnHeaders } from './wcag2/1/1.3/1.3.1/H51/table-row-and-column-headers';
import { TitleiFrame } from './wcag2/4/4.1/4.1.2/H64/title-iframe';
import { Flickering } from './wcag2/2/2.3/2.3.1/G19/flickering';
import { CssImagesConveyInformation } from './wcag2/1/1.1/1.1.1/F3/css-images-convey-information';
import { MissingAltAttribute } from './wcag2/1/1.1/1.1.1/F65/missing-alt-attribute';
import { CaptchaGoogle } from './wcag2/1/1.1/1.1.1/G144/captcha-google';
import { AreaMissingAlt } from './wcag2/1/1.1/1.1.1/H24/a-area-missing-alt';
import { AriaDescribedbyAssociation } from './wcag2/1/1.3/1.3.1/ARIA1/aria-describedby-association';
import { HeadingsHierarchy } from './wcag2/1/1.3/1.3.1/G141/headings-hierarchy';
import { AltColorConveyInformation } from './wcag2/1/1.4/1.4.1/F13/alt-color-convey-information';
import { TextColorConveyInformation } from './wcag2/1/1.4/1.4.1/G14/text-color-convey-information';
import { AutoplayAudioVideo } from './wcag2/1/1.4/1.4.2/autoplay-audio-video';
import { ZoomDisabled } from './wcag2/1/1.4/1.4.4/G142/zoom-disabled';
import { Animation } from './wcag2/2/2.2/2.2.2/F16/animation';
import { BlinkElement } from './wcag2/2/2.2/2.2.2/F74/blink-element';
import { AriaLabelledbyAssociation } from './wcag2/2/2.4/2.4.4/aria-labelledby-association';
import { ClickVerb } from './wcag2/2/2.4/2.4.4/click-verb';
import { NoHeadings } from './wcag2/2/2.4/2.4.10/no-headings';
import { FontStyleItalic } from './aslint/font-style-italic/font-style-italic';
import { HtmlLangAttr } from './wcag2/3/3.1/3.1.1/html-lang-attr';
import { DuplicatedIdAttribute } from './wcag2/4/4.1/4.1.1/F77/duplicated-id-attribute';
import { PositionSticky } from './wcag21/1/1.4/1.4.10/position-sticky';
import { TableCaptionSummaryIdentical } from './wcag2/1/1.3/1.3.1/H39/table-caption-summary-identical';
import { DuplicatedForAttribute } from './wcag2/1/1.3/1.3.1/H93/duplicated-for-attribute';
import { AccessibleSvg } from './wcag2/1/1.1/1.1.1/F65/accessible-svg';
import { OrientationRule } from './wcag21/1/1.3/1.3.4/orientation';
import { Reflow } from './wcag21/1/1.4/1.4.10/reflow';
import { Overlay } from './aslint/overlay/overlay';
import { AriaRoleDialog } from './aslint/aria-role-dialog/aria-role-dialog';
import { IdentifyInputPurpose } from './wcag21/1/1.3/1.3.5/identify-input-purpose';
import { EmptyHeading } from './wcag2/2/2.4/2.4.6/G130/empty-heading';
import { AltTextIncludeFilename } from './wcag2/1/1.1/1.1.1/F30/alt-text-include-filename';
import { LinksNotVisuallyEvidentWithoutColorVision } from './wcag2/1/1.4/1.4.1/F73/links-not-visually-evident-without-color-vision';
import { $runnerSettings } from '../constants/aslint';
import { Config } from '../config';
import { MotionActuation } from './wcag21/2/2.5/2.5.4/G213/motion-actuation';
import { Validator } from '../validator';
import { Standards } from '../interfaces/aslint.interface';
import { TextUtility } from '../utils/text';
import { IAuditRule } from '../interfaces/audit-rule.interface';
import { ObjectUtility } from '../utils/object';
import { EmptyButtonDescription } from './wcag2/4/4.1/4.1.2/H91/empty-button-description';
import { BrokenSamePageLink } from './wcag2/2/2.1/2.1.1/broken-same-page-link';
import { AriaLabelledbyAssociationEmptyElement } from './wcag2/2/2.4/2.4.4/aria-labelledby-association-empty-element';

export class LoadRules {
  private defaultRuleInstances: AbstractRule[];
  private configInstance: Config;

  constructor() {
    this.defaultRuleInstances = [];
    this.configInstance = Config.getInstance();
  }

  public get defaultRules(): AbstractRule[] {
    if (Array.isArray(this.defaultRuleInstances) && this.defaultRuleInstances.length > 0) {
      return this.defaultRuleInstances;
    }

    this.defaultRuleInstances = [
      new AccessibleSvg(),
      new AltTextIncludeFilename(),
      new AriaHiddenFalse(),
      new AriaRoleDialog(),
      new BrokenSamePageLink(),
      new CapitalLettersWords(),
      new ContentEditableMissingAttributes(),
      new ContentinfoLandmarkOnlyOne(),
      new ElementsNotAllowed(),
      new EmptyButtonDescription(),
      new EmptyLinkElement(),
      new EmptyTitleAttribute(),
      new FieldsetNoLegend(),
      new FlashContent(),
      new GroupElementsNameAttribute(),
      new H1MustBe(),
      new HeadingsSiblingUnique(),
      new HorizontalRule(),
      new IdentifyInputPurpose(),
      new IncorrectTechniqueForHidingContent(),
      new InvalidAttributeDirValue(),
      new LabelDuplicatedContentTitle(),
      new LabelImplicitlyAssociated(),
      new LabelInappropriateAssociation(),
      new LabelVisuallyHiddenOnly(),
      new LegendFirstChildOfFieldSet(),
      new LinkButtonSpaceKey(),
      new LinksNotVisuallyEvidentWithoutColorVision(),
      new LinkWithUnclearPurpose(),
      new LinksLanguageDestination(),
      new LinksNewWindowMark(),
      new LinksSameContentDifferenceUrl(),
      new MainElementOnlyOne(),
      new MainLandmarkMustBeTopLevel(),
      new MinimumFontSize(),
      new MissingHrefOnA(),
      new MissingLabel(),
      new MissingSubmitButton(),
      new MisusedAriaOnFocusableElement(),
      new MisusedInputAttribute(),
      new MisusedRequiredAttribute(),
      new MisusedTabindexAttribute(),
      new NavigationLandmarkRestrictions(),
      new EmptyHeading(),
      new NoMetaHttpEquivRefresh(),
      new ObsoleteHtmlAttributes(),
      new ObsoleteHtmlElements(),
      new OutlineZero(),
      new PositiveTabindex(),
      new RoleApplication(),
      new RtlContent(),
      new SelectInitialOption(),
      new TableMissingDescription(),
      new PageTitle(),
      new TitleForAbbr(),
      new UnclearAnchorUri(),
      new UnsupportedRoleOnElement(),
      new AreaMissingAlt(),
      new AppletMissingAlt(),
      new AppletMissingBody(),
      new AudioAlternative(),
      new GeneralAlt(),
      new ImgEmptyAltInLink(),
      new ImgEmptyAltWithEmptyTitle(),
      new ImgAdjacentDuplicateTextLink(),
      new ImgAltDuplicateTextLink(),
      new InputImageMissingAlt(),
      new ObjectGeneralAlt(),
      new ObjectMissingBody(),
      new Overlay(),
      new AudioVideoCaptions(),
      new VideoAudioDescriptions(),
      new MeaningfulContentSequence(),
      new TableRowAndColumnHeaders(),
      new TitleiFrame(),
      new Flickering(),
      new EmptyLabelElement(),
      new IncorrectLabelPlacement(),
      new ColorContrastA2(),
      new ColorContrastStatePseudoClassesActive(),
      new ColorContrastStatePseudoClassesFocus(),
      new ColorContrastStatePseudoClassesHover(),
      new ColorContrastA3(),
      new CssImagesConveyInformation(),
      new MissingAltAttribute(),
      new CaptchaGoogle(),
      new AriaDescribedbyAssociation(),
      new HeadingsHierarchy(),
      new AltColorConveyInformation(),
      new TextColorConveyInformation(),
      new AutoplayAudioVideo(),
      new ZoomDisabled(),
      new Animation(),
      new BlinkElement(),
      new AriaLabelledbyAssociation(),
      new AriaLabelledbyAssociationEmptyElement(),
      new ClickVerb(),
      new NoHeadings(),
      new FontStyleItalic(),
      new HtmlLangAttr(),
      new DuplicatedIdAttribute(),
      new PositionSticky(),
      new TableCaptionSummaryIdentical(),
      new DuplicatedForAttribute(),
      new OrientationRule(),
      new Reflow(),
      new MotionActuation()
    ];

    return this.defaultRuleInstances;
  }

  public get defaultRulesNames(): string[] {
    const getRuleId = (rule: AbstractRule): string => {
      return rule.id;
    };

    return this.defaultRules.map(getRuleId);
  }

  public registerDefaultRulesForValidator(): void {
    const registerRule = (rule: AbstractRule): void => {
      const accessibilityStandards: Standards = Validator.getAccessibilityStandards();
      const ruleId: string = TextUtility.convertDashesToUnderscores(rule.id);
      const customRuleConfig: IAuditRule | undefined = this.configInstance.get($runnerSettings.rules)[rule.id];

      if (ObjectUtility.getTypeOf(customRuleConfig) === 'object') {
        this.configInstance.get($runnerSettings.rules)[rule.id] = ObjectUtility.deepMerge(accessibilityStandards[ruleId as keyof typeof accessibilityStandards], customRuleConfig);
      } else {
        this.configInstance.get($runnerSettings.rules)[rule.id] = ObjectUtility.deepMerge(accessibilityStandards[ruleId as keyof typeof accessibilityStandards], rule.config);
      }

      rule.registerValidator();
    };

    this.defaultRules
      .forEach(registerRule);
  }

}
