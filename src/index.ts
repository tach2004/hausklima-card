import './hausklima-card';

interface CustomCardEntry { type: string; name: string; description: string; preview?: boolean; }
const registry = window as Window & { customCards?: CustomCardEntry[] };
registry.customCards ??= [];
if (!registry.customCards.some((card) => card.type === 'hausklima-card')) {
  registry.customCards.push({
    type: 'hausklima-card',
    name: 'HausKlima Card',
    description: 'Räumliche Hausklimaübersicht mit schematischer Gebäudeansicht.',
    preview: true,
  });
}
