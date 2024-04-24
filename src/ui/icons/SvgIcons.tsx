import { h } from "preact";

// icons are copied from 'node_modules/svg-icon/dist/svg/material'
// add {...props} and fill="currentColor" for more flexibility

export const Settings = (props: h.JSX.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 39.150001525878906 40.000003814697266"
    >
      <path
        fill="currentColor"
        d="M34.43 21.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43L28.7 8.11c-1.03-.79-2.16-1.46-3.38-1.97l-.75-5.3c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3a14.8 14.8 0 0 0-3.38 1.97L5.47 6.1a1 1 0 0 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31c-.08.64-.14 1.29-.14 1.95s.06 1.31.14 1.95L.49 25.26c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3a14.8 14.8 0 0 0 3.38-1.97l4.98 2.01a1 1 0 0 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM19.57 27c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
      />
    </svg>
  );
};

export const InsertLink = (props: h.JSX.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path
        fill="currentColor"
        d="M7.8 24c0-3.42 2.78-6.2 6.2-6.2h8V14h-8C8.48 14 4 18.48 4 24s4.48 10 10 10h8v-3.8h-8c-3.42 0-6.2-2.78-6.2-6.2zm8.2 2h16v-4H16v4zm18-12h-8v3.8h8c3.42 0 6.2 2.78 6.2 6.2s-2.78 6.2-6.2 6.2h-8V34h8c5.52 0 10-4.48 10-10s-4.48-10-10-10z"
      />
    </svg>
  );
};

export const AddCircleOutline = (props: h.JSX.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path
        fill="currentColor"
        d="M26 14h-4v8h-8v4h8v8h4v-8h8v-4h-8v-8zM24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16z"
      />
    </svg>
  );
};

export const AddCircle = (props: h.JSX.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path
        fill="currentColor"
        d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm10 22h-8v8h-4v-8h-8v-4h8v-8h4v8h8v4z"
      />
    </svg>
  );
};

export const MyLocation = (props: h.JSX.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path
        fill="currentColor"
        d="M24 16c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm17.88 6C40.96 13.66 34.34 7.04 26 6.12V2h-4v4.12C13.66 7.04 7.04 13.66 6.12 22H2v4h4.12c.92 8.34 7.54 14.96 15.88 15.88V46h4v-4.12c8.34-.92 14.96-7.54 15.88-15.88H46v-4h-4.12zM24 38c-7.73 0-14-6.27-14-14s6.27-14 14-14 14 6.27 14 14-6.27 14-14 14z"
      />
    </svg>
  );
};

export const RemoveFromList = (props: h.JSX.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M3 17v-2h2v2zm0-4v-2h2v2zm0-4V7h2v2zm4 12v-2h2v2zM7 5V3h2v2zm4 0V3h2v2zm1.5 16l-1.4-1.4l3.55-3.55l-3.55-3.55l1.4-1.4l3.55 3.55l3.55-3.55l1.4 1.4l-3.55 3.55L21 19.6L19.6 21l-3.55-3.55zM15 5V3h2v2zm4 4V7h2v2zM3 5V3h2v2zm18 0h-2V3h2zM3 21v-2h2v2z"
      />
    </svg>
  );
};
