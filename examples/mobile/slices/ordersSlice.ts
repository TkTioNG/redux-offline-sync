import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface OrdersState {
  orderIds: string[];
  orders: Record<string, any>;
  status: {
    orders: number;
  };
}

const initialState: OrdersState = {
  orderIds: [],
  orders: {},
  status: {
    orders: 0,
  },
};

const ORDERS = 'orders';
export const GET_ORDERS = `${ORDERS}/getOrdersAction`;
export const GET_ORDERS_REQUESTED = `${GET_ORDERS}Requested`;
export const GET_ORDERS_SUCCESS = `${GET_ORDERS}Success`;
export const GET_ORDERS_ERROR = `${GET_ORDERS}Error`;

const ordersSlice = createSlice({
  name: ORDERS,
  initialState: initialState,
  reducers: {
    getOrdersActionSuccess: (
      state: OrdersState,
      action: PayloadAction<any>
    ) => {
      state.orderIds = action.payload.orderIds;
      state.orders = Object.fromEntries(
        action.payload.orders.map((order: { id: string }) => [order.id, order])
      );
      state.status.orders = 2;
    },
  },
});

const getOrdersAction = () => ({
  type: GET_ORDERS_REQUESTED,
});

const { getOrdersActionSuccess } = ordersSlice.actions;

export { getOrdersAction, getOrdersActionSuccess };

export default ordersSlice.reducer;
