import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { ServiceDocument } from '../verification/schemas/service.schema';
// import { ServiceService } from '../service/service.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'worldisfullofdevelopers',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}

// export class APIKeyJwtStrategy extends PassportStrategy(Strategy, 'x-country-key') {
//   // constructor(private serviceService: ServiceService) {
//   //   super({
//   //     jwtFromRequest: ExtractJwt.fromHeader('x-country-key'),
//   //     ignoreExpiration: true,
//   //     secretOrKey: process.env.SERVICE_API_SECRET,
//   //   });
//   // }

//   async validate(payload: any): Promise<ServiceDocument> {
//     const { id, countryCode, version } = payload;
//     try {
//       const service = await this.serviceService.getService({ serviceId: id });
//       if (version !== service.apiKeyVersion) {
//         throw new UnauthorizedException();
//       }

//       return service;
//     } catch (err) {
//       throw new UnauthorizedException({ message: 'invalid credentials' });
//     }
//   }
// }

export type JWTPayload = {
  email: string;
  iat: number;
  exp: number;
};
