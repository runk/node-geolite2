export interface Geolite2Paths {
  'GeoLite2-ASN'?: string;
  'GeoLite2-City'?: string;
  'GeoLite2-Country'?: string;
  asn?: string;
  city?: string;
  country?: string;
  [editionId: string]: string | undefined;
}

export declare const paths: Geolite2Paths;

declare const geolite2: {
  paths: Geolite2Paths;
};

export default geolite2;
