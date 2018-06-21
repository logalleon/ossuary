interface ArbitraryData {
  val: string,
  [key: string]: any
}

const LegendaryData = {
  animals: {
    mammals: [
      'dog',
      'cat',
      'squirrel',
      'badger',
      'bear'
    ],
    reptiles: [
      'lizard'
    ]
  },
  mammals: [
    'dog',
    'cat',
    'squirrel',
    'badger',
    'bear'
  ],
  primates: [
    'lemur',
    'gorilla',
    'orangutan'
  ],
  reptiles: [
    'lizard'
  ]
};
export { LegendaryData, ArbitraryData };
