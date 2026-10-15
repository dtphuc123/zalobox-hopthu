import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard này dùng để bảo vệ các API cần đăng nhập.
// Nó gọi tới JwtStrategy (đã có ở jwt.strategy.ts) để xác thực token.
// Dùng bằng cách thêm @UseGuards(JwtAuthGuard) lên trên controller hoặc từng route.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}