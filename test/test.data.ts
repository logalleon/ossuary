interface ArbitraryData {
  val: string,
  [key: string]: any
}

const LegendaryData = {
  animals: {
    mammals: [
      'dog',
      'cat'
    ],
    reptiles: [
      'lizard'
    ]
  },
  mammals: [
    'dog',
    'cat'
  ],
  reptiles: [
    'lizard'
  ]
};
export { LegendaryData, ArbitraryData };
