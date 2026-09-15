const paths = {
  cube: 'm12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12 4 7.5M12 12v9M8 5.25l8 4.5',
  'arrow-right': 'M4 12h15m-6-6 6 6-6 6',
  'arrow-left': 'M20 12H5m6-6-6 6 6 6',
  rotate:
    'M20 7v5h-5M4 17v-5h5M6.2 7a7 7 0 0 1 11.7-1L20 9M4 15l2.1 3A7 7 0 0 0 18 17',
  pause: 'M8 5v14M16 5v14',
  reset: 'M4 4v6h6M4.5 10a8 8 0 1 1 .5 6M12 8v5l3 2',
  plus: 'M5 12h14M12 5v14',
  minus: 'M5 12h14',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  ruler: 'm4 16 12-12 5 5L9 21l-5-5Zm5-5 3 3m1-7 3 3M5 15l3 3',
  floorplan: 'M3 3h18v18h-7m-5 0H3V3Zm0 11h8V3m4 11h6M9 21v-7h5',
  expand: 'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5',
  close: 'm6 6 12 12M6 18 18 6',
  chevron: 'm9 5 7 7-7 7',
  info: 'M12 11v6m0-10v.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  power: 'm13 2-8 12h6l-1 8 9-13h-6l1-7Z',
  mouse: 'M12 3a6 6 0 0 1 6 6v6a6 6 0 0 1-12 0V9a6 6 0 0 1 6-6Zm0 0v6M6 10h12',
  github:
    'M9 19c-4.3 1.3-4.3-2.5-6-3m12 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-7 0C5.27.65 4.09 1 4.09 1A5.07 5.07 0 0 0 4 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 8 18.13V22',
}

export default function Icon({
  name,
  className = '',
}: {
  name: keyof typeof paths
  className?: string
}) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
