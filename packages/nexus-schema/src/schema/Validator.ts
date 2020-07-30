import { objectType } from '@nexus/schema';

export const Validator = objectType({
  name: 'Validator',
  definition(t) {
    t.field('pubkey', { type: 'Bytes', description: 'A validator public key' });

    t.int('proposeWeight', { description: 'Propose weight of a validator' });

    t.int('voteWeight', { description: 'Vote weight of a validator' });
  },
});
