from urllib.parse import urlparse
from typing import Dict, Any

class SourceVerifier:
    OFFICIAL_TLDS = ('.gov.in', '.nic.in', '.gov', '.mil.in', '.ac.in')
    AUTHORIZED_DOMAINS = (
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
    )

    @classmethod
    def verify_url(cls, raw_url: str) -> Dict[str, Any]:
        try:
            parsed = urlparse(raw_url)
            hostname = (parsed.hostname or "").lower()

            is_authorized = any(hostname == d or hostname.endswith(f".{d}") for d in cls.AUTHORIZED_DOMAINS)
            is_gov_tld = any(hostname.endswith(tld) for tld in cls.OFFICIAL_TLDS)

            if is_authorized or is_gov_tld:
                domain_cat = 'STATE_GOV' if any(k in hostname for k in ('.telangana.', 'ghmc.gov', 'cgg.gov')) else 'CENTRAL_GOV'
                return {
                    "is_official": True,
                    "trust_score": 100,
                    "domain_category": domain_cat,
                    "status": "VERIFIED"
                }

            suspicious = ('passport', 'parivahan', 'meeseva', 'aadhaar', 'voter', 'epass')
            if any(term in hostname for term in suspicious):
                return {
                    "is_official": False,
                    "trust_score": 25,
                    "domain_category": "UNVERIFIED",
                    "status": "NEEDS_VERIFICATION",
                    "warning": "Warning: Domain does not end in .gov.in or .nic.in. Beware of unverified third-party portals."
                }

            return {
                "is_official": False,
                "trust_score": 50,
                "domain_category": "UNVERIFIED",
                "status": "NEEDS_VERIFICATION",
                "warning": "External source requires official administrative review."
            }
        except Exception:
            return {
                "is_official": False,
                "trust_score": 0,
                "domain_category": "UNVERIFIED",
                "status": "CONFLICTING",
                "warning": "Invalid or malformed URL specified."
            }
