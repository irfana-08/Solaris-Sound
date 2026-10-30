import { Song, Playlist } from '../types/music';

export const INITIAL_SONGS: Song[] = [
  {
    id: 'song-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200, // 3:20
    year: 2020,
    genre: '80s Synthwave / Retro Pop',
    coverArt: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    audioUrl: '/audio/blinding_lights.mp3',
    lyrics: [
      { time: 0, text: "♪ [Iconic 80s Synth Intro] ♪" },
      { time: 14, text: "Yeah, I've been tryna call" },
      { time: 19, text: "I've been on my own for long enough" },
      { time: 24, text: "Maybe you can show me how to love, maybe" },
      { time: 31, text: "I'm going through withdrawals" },
      { time: 36, text: "You don't even have to do too much" },
      { time: 41, text: "You can turn me on with just a touch, baby" },
      { time: 48, text: "I look around and Sin City's cold and empty" },
      { time: 54, text: "No one's around to judge me" },
      { time: 58, text: "I can't see clearly when you're gone" },
      { time: 64, text: "I said, ooh, I'm blinded by the lights" },
      { time: 72, text: "No, I can't sleep until I feel your touch" },
      { time: 79, text: "I said, ooh, I'm drowning in the night" },
      { time: 87, text: "Oh, when I'm like this, you're the one I trust" },
      { time: 94, text: "♪ [Iconic Synth Riff: F - F - Eb - C - Eb - F - G] ♪" },
      { time: 110, text: "I'm running out of time" },
      { time: 115, text: "'Cause I can see the sun light up the sky" },
      { time: 120, text: "So I hit the road in overdrive, baby, oh" },
      { time: 128, text: "The city's cold and empty" },
      { time: 134, text: "No one's around to judge me" },
      { time: 139, text: "I can't see clearly when you're gone" },
      { time: 145, text: "I said, ooh, I'm blinded by the lights" },
      { time: 153, text: "No, I can't sleep until I feel your touch" },
      { time: 161, text: "I said, ooh, I'm drowning in the night" },
      { time: 169, text: "Oh, when I'm like this, you're the one I trust" }
    ],
    synthPreset: {
      bpm: 171,
      key: 'F Minor',
      timbre: '80s-retro',
      drumStyle: '80s-retro',
      scale: [174.61, 207.65, 233.08, 261.63, 311.13, 349.23, 392.0, 415.3],
      bassline: [87.31, 103.83, 69.3, 77.78],
      chords: [
        [174.61, 207.65, 261.63],
        [207.65, 261.63, 311.13],
        [138.59, 174.61, 207.65],
        [155.56, 196.0, 233.08]
      ],
      melodyPattern: [
        { noteIndex: 5, dur: 1 },
        { noteIndex: 5, dur: 1 },
        { noteIndex: 4, dur: 1 },
        { noteIndex: 3, dur: 1 },
        { noteIndex: 3, dur: 1 },
        { noteIndex: 4, dur: 1 },
        { noteIndex: 5, dur: 1 },
        { noteIndex: 6, dur: 1 }
      ]
    }
  },
  {
    id: 'song-2',
    title: 'STAY (with Justin Bieber)',
    artist: 'The Kid LAROI, Justin Bieber',
    album: 'F*CK LOVE 3+: OVER YOU',
    duration: 141, // 2:21 (matches mobile screenshot: 0:42 / 2:21)
    year: 2021,
    genre: 'Pop Punk / Synth-Pop',
    coverArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    audioUrl: '/audio/stay.mp3',
    lyrics: [
      { time: 0, text: "♪ [Bouncy Pop-Synth Intro] ♪" },
      { time: 6, text: "I do the same thing I told you that I never would" },
      { time: 11, text: "I told you I'd change, even when I knew I never could" },
      { time: 16, text: "Know that I can't find nobody else as good as you" },
      { time: 21, text: "I need you to stay, need you to stay, hey" },
      { time: 27, text: "I get drunk, wake up, I'm wasted still" },
      { time: 32, text: "I realize the time that I wasted here" },
      { time: 37, text: "I feel like you can't feel the way I still feel" },
      { time: 42, text: "Oh, I'll be fucked up if you can't be right here" },
      { time: 48, text: "Oh-oh-oh-whoa-oh, oh-oh-whoa-oh" },
      { time: 53, text: "Oh-oh-oh-whoa-oh, oh-oh-whoa-oh" },
      { time: 58, text: "I'll be fucked up if you can't be right here" },
      { time: 64, text: "When I'm away from you, I miss your touch (ooh)" },
      { time: 69, text: "You're the reason I believe in love" },
      { time: 74, text: "It's been difficult for me to trust (ooh)" },
      { time: 79, text: "And I'm afraid that I'ma fuck it up" },
      { time: 84, text: "Ain't no way that I can leave you stranded" },
      { time: 89, text: "'Cause you ain't ever left me empty-handed" },
      { time: 94, text: "And you know that I know that I can't live without you" },
      { time: 100, text: "So, baby, stay" },
      { time: 105, text: "Oh-oh-oh-whoa-oh, oh-oh-whoa-oh" },
      { time: 115, text: "I need you to stay, need you to stay, hey" }
    ],
    synthPreset: {
      bpm: 170,
      key: 'C# Minor / E Major',
      timbre: 'warm-synth',
      drumStyle: 'pop-punch',
      scale: [277.18, 311.13, 329.63, 369.99, 415.3, 440.0, 493.88, 554.37],
      bassline: [138.59, 110.0, 164.81, 123.47],
      chords: [
        [277.18, 329.63, 415.3],
        [220.0, 277.18, 329.63],
        [164.81, 207.65, 246.94],
        [246.94, 311.13, 369.99]
      ],
      melodyPattern: [
        { noteIndex: 4, dur: 1 },
        { noteIndex: 4, dur: 1 },
        { noteIndex: 3, dur: 1 },
        { noteIndex: 2, dur: 1 }
      ]
    }
  },
  {
    id: 'song-4',
    title: 'Nobody Gets Me',
    artist: 'SZA',
    album: 'SOS',
    duration: 180, // 3:00
    year: 2022,
    genre: 'R&B / Soulful Acoustic',
    coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    audioUrl: '/audio/nobody_gets_me.m4a',
    lyrics: [
      { time: 0, text: "♪ [Gentle Acoustic Guitar Arpeggios] ♪" },
      { time: 8, text: "Took a long vacation, no make-up, just chill" },
      { time: 14, text: "You were talking crazy, I wasn't trying to hear" },
      { time: 20, text: "You were always saying that I don't give a fuck" },
      { time: 26, text: "How am I supposed to let you go?" },
      { time: 33, text: "Only like myself when I'm with you" },
      { time: 40, text: "Nobody gets me, you do" },
      { time: 47, text: "Nobody gets me, you do" },
      { time: 54, text: "Nobody gets me, you do" },
      { time: 61, text: "Nobody gets me, you do" },
      { time: 68, text: "What's wrong with me? Had to get you off my chest" },
      { time: 76, text: "Stuck in the memories of the way you made me feel" },
      { time: 84, text: "How am I supposed to tell you I don't want no one else?" },
      { time: 92, text: "Nobody gets me, you do" }
    ],
    synthPreset: {
      bpm: 70,
      key: 'G Major / 6-8',
      timbre: 'lofi',
      drumStyle: 'lofi-chill',
      scale: [196.0, 220.0, 246.94, 261.63, 293.66, 329.63, 369.99, 392.0],
      bassline: [98.0, 110.0, 87.31, 130.81],
      chords: [
        [196.0, 246.94, 293.66],
        [220.0, 261.63, 329.63],
        [174.61, 220.0, 261.63],
        [130.81, 164.81, 196.0]
      ],
      melodyPattern: [
        { noteIndex: 4, dur: 2 },
        { noteIndex: 3, dur: 1 }
      ]
    }
  },
  {
    id: 'song-5',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 233, // 3:53
    year: 2017,
    genre: 'Tropical Pop / Snappy Marimba',
    coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    audioUrl: '/audio/shape_of_you.mp3',
    lyrics: [
      { time: 0, text: "♪ [Iconic Marimba Riff] ♪" },
      { time: 10, text: "The club isn't the best place to find a lover" },
      { time: 13, text: "So the bar is where I go" },
      { time: 15, text: "Me and my friends at the table doing shots" },
      { time: 18, text: "Drinking fast and then we talk slow" },
      { time: 20, text: "Come over and start up a conversation with just me" },
      { time: 23, text: "And trust me I'll give it a chance now" },
      { time: 25, text: "Took my hand, stop, put Van the Man on the jukebox" },
      { time: 28, text: "And then we start to dance, and now I'm singing like" },
      { time: 31, text: "Girl, you know I want your love" },
      { time: 33, text: "Your love was handmade for somebody like me" },
      { time: 36, text: "Come on now, follow my lead" },
      { time: 38, text: "I may be crazy, don't mind me" },
      { time: 41, text: "Say, boy, let's not talk too much" },
      { time: 43, text: "Grab on my waist and put that body on me" },
      { time: 46, text: "Come on now, follow my lead" },
      { time: 49, text: "Come, come on now, follow my lead" },
      { time: 51, text: "I'm in love with the shape of you" },
      { time: 54, text: "We push and pull like a magnet do" },
      { time: 56, text: "Although my heart is falling too" },
      { time: 59, text: "I'm in love with your body" },
      { time: 62, text: "And last night you were in my room" },
      { time: 64, text: "And now my bedsheets smell like you" },
      { time: 67, text: "Every day discovering something brand new" },
      { time: 70, text: "I'm in love with your body" }
    ],
    synthPreset: {
      bpm: 96,
      key: 'C# Minor',
      timbre: 'marimba',
      drumStyle: 'marimba-groove',
      scale: [277.18, 311.13, 329.63, 369.99, 415.3, 440.0, 493.88],
      bassline: [138.59, 110.0, 164.81, 123.47],
      chords: [
        [277.18, 329.63, 415.3],
        [220.0, 277.18, 329.63],
        [164.81, 207.65, 246.94],
        [246.94, 311.13, 369.99]
      ],
      melodyPattern: [
        { noteIndex: 0, dur: 1 },
        { noteIndex: 2, dur: 1 },
        { noteIndex: 0, dur: 1 },
        { noteIndex: 0, dur: 1 }
      ]
    }
  },
  {
    id: 'song-6',
    title: 'GATA ONLY',
    artist: 'FloyyMenor, Cris MJ',
    album: 'EL COMIENZO',
    duration: 222, // 3:42
    year: 2024,
    genre: 'Reggaeton / Latin Hit',
    coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    audioUrl: '/audio/gata_only.mp3',
    lyrics: [
      { time: 0, text: "♪ [Bouncy Reggaeton Dembow Intro] ♪" },
      { time: 10, text: "Mami, dime si tú estás sola o estás con él" },
      { time: 16, text: "Pa' pasar a buscarte y comerte toda, bebé" },
      { time: 22, text: "Si tú estás puesta pa' mí, yo estoy puesto pa' ti" },
      { time: 27, text: "Dime dónde y le caigo de una" },
      { time: 33, text: "Tú estás sola y yo estoy solo" },
      { time: 38, text: "Y la noche se presta pa' hacer de todo" },
      { time: 44, text: "Mami, dime si tú estás sola o estás con él" },
      { time: 50, text: "Pa' pasar a buscarte y comerte toda, bebé" }
    ],
    synthPreset: {
      bpm: 100,
      key: 'A Minor / Reggaeton',
      timbre: 'pluck',
      drumStyle: 'tropical',
      scale: [220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0],
      bassline: [110.0, 87.31, 130.81, 98.0],
      chords: [
        [220.0, 261.63, 329.63],
        [174.61, 220.0, 261.63],
        [130.81, 164.81, 196.0],
        [196.0, 246.94, 293.66]
      ],
      melodyPattern: [
        { noteIndex: 2, dur: 1 },
        { noteIndex: 3, dur: 1 }
      ]
    }
  },
  {
    id: 'song-7',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    duration: 230, // 3:50
    year: 2016,
    genre: 'Dark Electro / R&B Vocoder',
    coverArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
    audioUrl: '/audio/starboy.mp3',
    lyrics: [
      { time: 0, text: "♪ [Electro-Funk Daft Punk Beat] ♪" },
      { time: 10, text: "I'm tryna put you in the worst mood, ah" },
      { time: 15, text: "P1 cleaner than your church shoes, ah" },
      { time: 20, text: "Milli point two just to hurt you, ah" },
      { time: 25, text: "All red Lamb' just to tease you, ah" },
      { time: 30, text: "None of these toys on lease too, ah" },
      { time: 35, text: "Made your whole year in a week too, yah" },
      { time: 40, text: "Main bitch out of your league too, ah" },
      { time: 45, text: "Side bitch out of your league too, ah" },
      { time: 51, text: "Look what you've done" },
      { time: 55, text: "I'm a motherfuckin' starboy" },
      { time: 61, text: "Look what you've done" },
      { time: 66, text: "I'm a motherfuckin' starboy" }
    ],
    synthPreset: {
      bpm: 186,
      key: 'G Minor',
      timbre: '80s-retro',
      drumStyle: '80s-retro',
      scale: [196.0, 220.0, 233.08, 261.63, 293.66, 311.13, 349.23, 392.0],
      bassline: [98.0, 116.54, 130.81, 146.83],
      chords: [
        [196.0, 233.08, 293.66],
        [233.08, 293.66, 349.23],
        [261.63, 311.13, 392.0],
        [293.66, 349.23, 440.0]
      ],
      melodyPattern: [
        { noteIndex: 4, dur: 1 },
        { noteIndex: 2, dur: 1 }
      ]
    }
  },
  {
    id: 'song-8',
    title: 'Golden Hour',
    artist: 'JVKE',
    album: 'this is what ____ feels like',
    duration: 209, // 3:29
    year: 2022,
    genre: 'Cinematic Cascading Piano / Pop',
    coverArt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    audioUrl: '/audio/golden_hour.mp3',
    lyrics: [
      { time: 0, text: "♪ [Rapid Cascading Piano Arpeggios] ♪" },
      { time: 10, text: "It was just two lovers" },
      { time: 14, text: "Sittin' in the car, listenin' to Blonde" },
      { time: 17, text: "Fallin' for each other" },
      { time: 20, text: "Pink and orange skies, feelin' super childish" },
      { time: 24, text: "No Donald Glover" },
      { time: 27, text: "Missed call from my mother" },
      { time: 30, text: "Like, Where you at tonight?" },
      { time: 32, text: "Got no alibi" },
      { time: 34, text: "I was all alone with the love of my life" },
      { time: 39, text: "She's got glitter for skin, my radiant beam in the night" },
      { time: 47, text: "I don't need no light to see you" },
      { time: 52, text: "Shine, it's your golden hour (oh)" },
      { time: 59, text: "You slow down time in your golden hour" }
    ],
    synthPreset: {
      bpm: 94,
      key: 'E Major / Cascading',
      timbre: 'ambient-pad',
      drumStyle: 'cascading-piano',
      scale: [261.63, 329.63, 392.0, 493.88, 523.25, 659.25, 783.99, 987.77],
      bassline: [65.41, 82.41, 98.0, 110.0],
      chords: [
        [261.63, 329.63, 392.0, 493.88],
        [196.0, 246.94, 293.66, 369.99],
        [220.0, 261.63, 329.63, 392.0],
        [174.61, 220.0, 261.63, 329.63]
      ],
      melodyPattern: [
        { noteIndex: 0, dur: 0.5 },
        { noteIndex: 1, dur: 0.5 },
        { noteIndex: 2, dur: 0.5 }
      ]
    }
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-amber-gold',
    name: 'Sunset & Amber Glow',
    description: 'Warm chords, golden hour synthpop, and radiant sunset vibrations.',
    coverArt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    songIds: ['song-1', 'song-2', 'song-8', 'song-5'],
    isCustom: false
  },
  {
    id: 'pl-trending',
    name: 'Top Chart Hits',
    description: 'The world’s most played anthems and viral pop melodies.',
    coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    songIds: ['song-1', 'song-2', 'song-5', 'song-7'],
    isCustom: false
  },
  {
    id: 'pl-late-night',
    name: 'Midnight Drive',
    description: 'Neon synthwave, deep 808s, and nocturnal dream pop.',
    coverArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
    songIds: ['song-7', 'song-1', 'song-6', 'song-4'],
    isCustom: false
  },
  {
    id: 'pl-lofi-chill',
    name: 'Acoustic & Lo-Fi Lounge',
    description: 'Gentle soul, mellow acoustics, and warm relaxing coffeehouse beats.',
    coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    songIds: ['song-4', 'song-8', 'song-5', 'song-6'],
    isCustom: false
  }
];
