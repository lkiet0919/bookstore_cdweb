package nlu.com.app.service;

import java.util.List;
import nlu.com.app.dto.response.PaymentMethodDTO;

public interface IPaymentMethodService {

  List<PaymentMethodDTO> getAllPaymentMethods();
}
