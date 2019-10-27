import { AccountStore } from './AccountStore';
import { STORE_ACCOUNT } from '../constants';

const accountStore = new AccountStore();

export default {
  [STORE_ACCOUNT]: accountStore,
};
