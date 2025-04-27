// import { Exclude } from 'class-transformer';
// import {
//   IsString,
//   Min,
//   Max,
//   IsEmail,
//   IsNotEmpty,
//   Length,
//   IsUrl,
//   IsEnum,
//   IsDate,
// } from 'class-validator';
// import { UserRole } from 'src/shared/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { Collections } from 'src/config/constants';

export const baseUserSelection: (keyof User)[] = [
  'first_name',
  'last_name',
  'profile_picture',
  'last_login',
];

@Schema({ timestamps: true, collection: Collections.USERS })
export class User extends Document {
  @Prop({ required: true, type: String, length: 50 })
  // @IsString()
  // @Min(2)
  // @Max(50)
  first_name: string;

  @Prop({ required: true, type: String, length: 50 })
  // @IsString()
  // @Min(2)
  // @Max(50)
  last_name: string;

  @Prop({ required: true, type: String, length: 50 })
  // @IsString()
  // @IsNotEmpty()
  // @IsEmail()
  email: string;

  // @Exclude()
  @Prop({ required: true, type: String, length: 100 })
  // @IsString()
  // @Length(8, 20)
  password: string;

  @Prop({ required: false, type: String })
  // @IsString()
  // @IsUrl()
  profile_picture: string;

  // @Prop({
  //   required: true,
  //   type: String,
  //   enum: UserRole,
  //   default: UserRole.USER,
  // })
  // @IsString()
  // @IsEnum(UserRole)
  // role: UserRole;

  @Prop({
    required: false,
    type: Date,
    default: Date.now(),
  })
  // @IsDate()
  last_login: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('save', function (next) {
  this.first_name = this.first_name.toLowerCase();
  this.last_name = this.last_name.toLowerCase();
  this.email = this.email.toLowerCase();
  return next();
});
