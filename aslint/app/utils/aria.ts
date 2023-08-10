import { ROLES, TAG_TO_IMPLICIT_SEMANTIC_INFO } from '../constants/aria';
import { IElementRoles } from '../interfaces/aria.interface';
import { CommonUtility } from './common';
import { ObjectUtility } from './object';

export class Aria {

  public static getHtmlInfo(element: Element): any {
    let htmlInfo: any;
    let defaultInfo: any; // will contain the info with no specific selector if no others match;

    if (ObjectUtility.isHtmlElement(element) === false) {
      return null;
    }

    if (typeof element.tagName !== 'string') {
      return null;
    }

    const tagName: string = element.tagName.toUpperCase();
    const infos: string[] = TAG_TO_IMPLICIT_SEMANTIC_INFO[tagName as keyof typeof TAG_TO_IMPLICIT_SEMANTIC_INFO];

    if (typeof infos === 'undefined') {
      return null;
    }

    const len: number = infos.length;

    defaultInfo = null; // will contain the info with no specific selector if no others match

    for (let i: number = 0; i < len; i += 1) {
      htmlInfo = infos[i];

      if (htmlInfo.selector) {
        if (element.matches(htmlInfo.selector)) {
          return htmlInfo;
        }
      } else {
        defaultInfo = htmlInfo;
      }
    }

    return defaultInfo;
  }

  /**
   * @param {Element} element
   * @return {string} role
   */

  public static getImplicitRole(element: Element): string {
    const htmlInfo: any = Aria.getHtmlInfo(element);

    return htmlInfo ? htmlInfo.role : '';
  }

  /**
   *
   * Gets role details from an element.
   * @param {Element} element The DOM element whose role we want.
   * @param {boolean=} implicit if true then implicit semantics will be considered if there is no role attribute.
   *
   * @return {Object}
   */
  public static getRoles(element: Element, implicit?: boolean | undefined): IElementRoles | null {
    let roleValue: string | null;
    let role: any;
    let ariaRole: any;
    let roleObject: any;

    if (typeof element === 'undefined' || element.nodeType !== Node.ELEMENT_NODE || element.hasAttribute('role') === false && (typeof implicit === 'boolean' && implicit === false)) {
      return null;
    }

    roleValue = element.getAttribute('role');

    if (roleValue === null && implicit) {
      roleValue = Aria.getImplicitRole(element);
    }

    if (typeof roleValue === 'string' && roleValue.length === 0) { // role='' or implicit role came up empty
      return null;
    }

    const roleNames: string[] = roleValue!.split(' ');

    const result: IElementRoles = {
      applied: {},
      roles: [],
      valid: false
    };

    for (let i: number = 0, len: number = roleNames.length; i < len; i += 1) {
      role = roleNames[i];
      ariaRole = ROLES[role];

      roleObject = {
        name: role
      };

      if (ariaRole && ariaRole.abstract === false) {
        roleObject.details = ariaRole;

        if (CommonUtility.hasKey(result, 'applied.name') === false) {
          result.applied = roleObject;
        }

        roleObject.valid = result.valid = true;

      } else {
        roleObject.valid = false;
      }

      result.roles.push(roleObject);
    }

    return result;
  }

}
