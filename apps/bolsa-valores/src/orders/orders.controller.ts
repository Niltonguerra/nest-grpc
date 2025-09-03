/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '../auth/auth.guard';

// o protobuf faz o gerenciamento da deserialização e serialização dos dados
@UseGuards(AuthGuard)
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @GrpcMethod('OrderService', 'CreateOrder')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    return {
      order: {
        order_id: order.id.toString(),
        account_id: order.account_id,
        asset_id: order.asset_id,
        quantity: order.quantity,
        status: order.status,
      },
    };
  }

  @GrpcMethod('OrderService', 'FindAllOrders')
  async findAll(@Payload() findAllOrdersDto: { account_id: string }) {
    const orders = await this.ordersService.findAll(
      findAllOrdersDto.account_id,
    );
    return {
      orders: orders.map((order) => ({
        order_id: order.id.toString(),
        account_id: order.account_id,
        asset_id: order.asset_id,
        quantity: order.quantity,
        status: order.status,
      })),
    };
  }

  @GrpcMethod('OrderService', 'FindOneOrder')
  async findOne(@Payload() findOneOrderDto: { order_id: string }) {
    const order = await this.ordersService.findOne(findOneOrderDto.order_id);
    return {
      order: {
        order_id: order.id.toString(),
        account_id: order.account_id,
        asset_id: order.asset_id,
        quantity: order.quantity,
        status: order.status,
      },
    };
  }

  @MessagePattern('updateOrder')
  update(@Payload() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(updateOrderDto.id, updateOrderDto);
  }

  @MessagePattern('removeOrder')
  remove(@Payload() id: string) {
    return this.ordersService.remove(id);
  }
}
