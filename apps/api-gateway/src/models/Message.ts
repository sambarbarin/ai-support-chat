import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import { v4 as uuidv4 } from 'uuid';
import Conversation from './Conversation';

class Message extends Model {
  public id!: string;
  public conversationId!: string;
  public role!: 'user' | 'assistant';
  public content!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Conversation,
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'message',
    timestamps: true,
  }
);

// Define associations
Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages',
  onDelete: 'CASCADE',
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation',
});

export default Message;
