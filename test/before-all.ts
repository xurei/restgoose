import { Restgoose } from '../lib';
import { RestgooseMongodbConnector } from '../../restgoose-mongodb-connector/lib/index';

Restgoose.setConnector(new RestgooseMongodbConnector());
