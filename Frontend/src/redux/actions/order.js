import axios from "axios";
import { server } from "../../server";

export const getAllOrders = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersRequest",
    });
    const { data } = await axios.get(
      `${server}/order/get-all-orders/${id}`
    );
    dispatch({
      type: "getAllOrdersSuccess",
      payload: data.orders,
    });
  } catch (error) {
    dispatch({
      type: "getAllOrdersFailed",
      payload: error.response.data.message,
    });
  }
};

export const getAllOrdersOfShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersOfShopRequest",
    });
    const { data } = await axios.get(
      `${server}/order/get-seller-all-orders/${id}`
    );
    dispatch({
      type: "getAllOrdersOfShopSuccess",
      payload: data.orders,
    });
  } catch (error) {
    dispatch({
      type: "getAllOrdersOfShopFailed",
      payload: error.response.data.message,
    });
  }
};
