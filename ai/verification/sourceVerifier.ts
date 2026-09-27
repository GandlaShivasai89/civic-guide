/**
 * CivicGuide AI - Source Verification & Accuracy Layer
 * Ensures only authoritative government portals, gazettes, and official notifications
 * are presented to the citizen.
 */

export interface SourceValidationResult {
  isOfficialGovDomain: boolean;
  trustScore: number; // 0 - 100
  domainCategory: 'CENTRAL_GOV' | 'STATE_GOV' | 'NIC_PORTAL' | 'PUBLIC_UTILITY' | 'UNVERIFIED';
  status: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'CONFLICTING';
  safetyWarning?: string;
}

export class SourceVerifier {
  private static OFFICIAL_GOV_TLDS = ['.gov.in', '.nic.in', '.gov', '.mil.in', '.ac.in'];
  private static AUTHORIZED_DOMAINS = [
    'passportindia.gov.in',
    'parivahan.gov.in',
    'incometax.gov.in',
    'uidai.gov.in',
    'voters.eci.gov.in',
    'udyamregistration.gov.in',
    'crsorgi.gov.in',
    'meeseva.telangana.gov.in',
    'telanganaepass.cgg.gov.in',
    'ghmc.gov.in',
    'egazette.gov.in',
    'services.india.gov.in',
    'digilocker.gov.in',
    'scholarships.gov.in'
  ];

  /**
   * Verify an official government URL
   */
  public static verifyUrl(rawUrl: string): SourceValidationResult {
    try {
      const parsed = new URL(rawUrl);
      const hostname = parsed.hostname.toLowerCase();

      // Check against known high-trust portals
      const isKnownAuthorized = this.AUTHORIZED_DOMAINS.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );

      // Check standard TLDs
      const isGovTld = this.OFFICIAL_GOV_TLDS.some(tld => hostname.endsWith(tld));

      if (isKnownAuthorized || isGovTld) {
        let domainCat: SourceValidationResult['domainCategory'] = 'CENTRAL_GOV';
        if (hostname.includes('.telangana.') || hostname.includes('ghmc.gov') || hostname.includes('cgg.gov')) {
          domainCat = 'STATE_GOV';
        } else if (hostname.endsWith('.nic.in')) {
          domainCat = 'NIC_PORTAL';
        }

        return {
          isOfficialGovDomain: true,
          trustScore: 100,
          domainCategory: domainCat,
          status: 'VERIFIED'
        };
      }

      // Check for suspicious commercial clones (.com, .org pretending to be passport or RTO)
      const suspiciousTerms = ['passport', 'parivahan', 'meeseva', 'aadhaar', 'voter', 'epass'];
      const hasSuspiciousTerms = suspiciousTerms.some(term => hostname.includes(term));

      if (hasSuspiciousTerms) {
        return {
          isOfficialGovDomain: false,
          trustScore: 25,
          domainCategory: 'UNVERIFIED',
          status: 'NEEDS_VERIFICATION',
          safetyWarning: 'Warning: This source is not on an official .gov.in or .nic.in domain. Beware of fake intermediary websites.'
        };
      }

      return {
        isOfficialGovDomain: false,
        trustScore: 40,
        domainCategory: 'UNVERIFIED',
        status: 'NEEDS_VERIFICATION',
        safetyWarning: 'Notice: Third-party documentation requires official verification before relying on it.'
      };
    } catch {
      return {
        isOfficialGovDomain: false,
        trustScore: 0,
        domainCategory: 'UNVERIFIED',
        status: 'CONFLICTING',
        safetyWarning: 'Invalid or malformed URL specified.'
      };
    }
  }

  /**
   * Check if verification date is fresh (within 180 days)
   */
  public static isVerificationFresh(lastVerifiedDate: string | Date): { isFresh: boolean; daysAgo: number } {
    const verified = new Date(lastVerifiedDate);
    const now = new Date();
    const diffMs = now.getTime() - verified.getTime();
    const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return {
      isFresh: daysAgo <= 180,
      daysAgo
    };
  }
}
