import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import { v4 as uuidv4 } from 'uuid';

class Conversation extends Model {
  public id!: string;
  public title!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'conversation',
    timestamps: true,
  }
);

export default Conversation;
