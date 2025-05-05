package com.strive.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

import java.util.Base64;
import java.util.List;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

import com.strive.backend.model.OrderItem;
import com.strive.backend.model.Product;
import com.strive.backend.model.ProductImage;
import com.strive.backend.repository.ProductRepository;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender emailSender;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Welcome to Strive!";
        try {
            String htmlContent = "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset='utf-8'>\n" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
                "    <title>Welcome to Strive</title>\n" +
                "</head>\n" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9;'>\n" +
                "    <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);'>\n" +
                "        <!-- Header -->\n" +
                "        <div style='background-color: #000; padding: 20px; text-align: center;'>\n" +
                "            <h1 style='color: #fff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;'>STRIVE</h1>\n" +
                "        </div>\n" +
                "        \n" +
                "        <!-- Content -->\n" +
                "        <div style='padding: 30px;'>\n" +
                "            <h2 style='margin-top: 0; color: #333;'>Welcome to Strive!</h2>\n" +
                "            <p>Hello " + firstName + ",</p>\n" +
                "            <p>Thank you for creating an account with Strive! We're excited to have you join our community.</p>\n" +
                "            \n" +
                "            <!-- Welcome Box -->\n" +
                "            <div style='background-color: #f5f5f5; border-radius: 6px; padding: 20px; margin: 20px 0;'>\n" +
                "                <h3 style='margin-top: 0; color: #333; font-size: 18px;'>Your Account Benefits</h3>\n" +
                "                <ul style='margin: 15px 0; padding-left: 20px;'>\n" +
                "                    <li style='margin-bottom: 8px;'>Shop our exclusive collection of premium products</li>\n" +
                "                    <li style='margin-bottom: 8px;'>Track your orders easily in your account dashboard</li>\n" +
                "                    <li style='margin-bottom: 8px;'>Save your favorite items to your wishlist</li>\n" +
                "                    <li style='margin-bottom: 8px;'>Get early access to special offers and promotions</li>\n" +
                "                </ul>\n" +
                "            </div>\n" +
                "            \n" +
                "            <!-- Call to Action -->\n" +
                "            <div style='text-align: center; margin: 30px 0;'>\n" +
                "                <a href='" + frontendUrl + "/products' style='background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;'>Start Shopping</a>\n" +
                "            </div>\n" +
                "            \n" +
                "            <p>If you have any questions or need assistance, please don't hesitate to contact our customer support team.</p>\n" +
                "            <p>Thank you for choosing Strive!</p>\n" +
                "            <p>Best regards,<br>The Strive Team</p>\n" +
                "        </div>\n" +
                "        \n" +
                "        <!-- Footer -->\n" +
                "        <div style='background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;'>\n" +
                "            <p>&copy; " + java.time.Year.now().getValue() + " Strive. All rights reserved.</p>\n" +
                "            <p>\n" +
                "                <a href='" + frontendUrl + "/privacy-policy' style='color: #666; text-decoration: underline; margin: 0 10px;'>Privacy Policy</a>\n" +
                "                <a href='" + frontendUrl + "/terms' style='color: #666; text-decoration: underline; margin: 0 10px;'>Terms of Service</a>\n" +
                "                <a href='" + frontendUrl + "/contact' style='color: #666; text-decoration: underline; margin: 0 10px;'>Contact Us</a>\n" +
                "            </p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
            
            sendHtmlEmail(to, subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send HTML welcome email: {}", e.getMessage(), e);
            // Fallback to plain text email
            String text = "Hello " + firstName + ",\n\n"
                    + "Welcome to Strive! We're excited to have you on board.\n\n"
                    + "With your new account, you can browse our products, make purchases, and track your orders.\n\n"
                    + "If you have any questions or need assistance, please don't hesitate to contact our customer support team.\n\n"
                    + "Thank you for choosing Strive!\n\n"
                    + "Best regards,\n"
                    + "The Strive Team";
            
            sendEmail(to, subject, text);
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String firstName, String resetToken) {
        String subject = "Strive - Password Reset Request";
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
        
        String text = "Hello " + firstName + ",\n\n"
                + "We received a request to reset your password for your Strive account.\n\n"
                + "To reset your password, please click on the link below or copy and paste it into your browser:\n\n"
                + resetUrl + "\n\n"
                + "This link will expire in 30 minutes for security reasons.\n\n"
                + "If you did not request a password reset, please ignore this email or contact our support team.\n\n"
                + "Thank you,\n"
                + "The Strive Team";
        
        sendEmail(to, subject, text);
    }

    @Override
    public void sendOrderConfirmationEmail(String to, String firstName, Long orderId, String totalAmount) {
        String subject = "Strive - Order Confirmation #" + orderId;
        String orderUrl = frontendUrl + "/orders";
        
        String text = "Hello " + firstName + ",\n\n"
                + "Thank you for your order! We're pleased to confirm that your order #" + orderId + " has been received and is being processed.\n\n"
                + "Order Details:\n"
                + "- Order Number: #" + orderId + "\n"
                + "- Order Date: " + java.time.LocalDate.now().toString() + "\n"
                + "- Total Amount: $" + totalAmount + "\n\n"
                + "You can view your complete order details and track your shipment by visiting your account:\n"
                + orderUrl + "\n\n"
                + "If you have any questions about your order, please contact our customer support team.\n\n"
                + "Thank you for shopping with Strive!\n\n"
                + "Best regards,\n"
                + "The Strive Team";
        
        sendEmail(to, subject, text);
    }
    
    @Override
    public void sendHtmlOrderConfirmationEmail(String to, String firstName, Long orderId, String totalAmount, List<OrderItem> orderItems) {
        try {
            String subject = "Thank you for your Strive order #" + orderId;
            
            StringBuilder itemsHtml = new StringBuilder();
            
            for (OrderItem item : orderItems) {
                try {
                    Product product = productRepository.findById(item.getProductId().intValue())
                        .orElse(null);
                    
                    if (product != null) {
                        String productImage = "";
                        
                        // Get the first product image if available
                        if (product.getImages() != null && !product.getImages().isEmpty()) {
                            ProductImage image = product.getImages().get(0);
                            // Limit the image size for email - resize if necessary
                            byte[] imageData = image.getImageData();
                            if (imageData.length > 100000) { // If image is larger than ~100KB
                                log.info("Image for product {} is too large ({}KB), using placeholder", 
                                    product.getId(), imageData.length / 1024);
                                productImage = ""; // Don't include very large images in email
                            } else {
                                String base64Image = Base64.getEncoder().encodeToString(imageData);
                                productImage = "data:" + image.getImageType() + ";base64," + base64Image;
                            }
                        }
                        
                        itemsHtml.append("<tr style='border-bottom: 1px solid #e5e5e5;'>");
                        
                        // Product Image
                        itemsHtml.append("<td style='padding: 15px; text-align: center;'>");
                        if (!productImage.isEmpty()) {
                            itemsHtml.append("<img src='").append(productImage).append("' alt='").append(product.getName()).append("' style='width: 80px; height: 80px; object-fit: cover; border-radius: 4px;' />");
                        } else {
                            itemsHtml.append("<div style='width: 80px; height: 80px; background-color: #f0f0f0; border-radius: 4px; display: inline-block; line-height: 80px; text-align: center;'>No Image</div>");
                        }
                        itemsHtml.append("</td>");
                        
                        // Product Details
                        itemsHtml.append("<td style='padding: 15px;'>");
                        itemsHtml.append("<h3 style='margin: 0 0 5px 0; font-size: 16px;'>").append(product.getName()).append("</h3>");
                        itemsHtml.append("<p style='margin: 0; color: #666; font-size: 14px;'>Size: ").append(item.getSize()).append("</p>");
                        itemsHtml.append("</td>");
                        
                        // Quantity
                        itemsHtml.append("<td style='padding: 15px; text-align: center;'>").append(item.getQuantity()).append("</td>");
                        
                        // Price
                        itemsHtml.append("<td style='padding: 15px; text-align: right;'>$").append(item.getPrice()).append("</td>");
                        
                        itemsHtml.append("</tr>");
                    }
                } catch (Exception e) {
                    log.error("Error processing order item for email: {}", e.getMessage(), e);
                    // Add a basic row without image if there's an error
                    itemsHtml.append("<tr><td colspan='4' style='padding: 15px;'>Item #").append(item.getProductId())
                        .append(" - Qty: ").append(item.getQuantity())
                        .append(" - Size: ").append(item.getSize())
                        .append(" - $").append(item.getPrice())
                        .append("</td></tr>");
                }
            }
            
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
            String formattedDate = java.time.LocalDate.now().format(dateFormatter);
            
            String htmlContent = "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset='utf-8'>\n" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
                "    <title>Order Confirmation</title>\n" +
                "</head>\n" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9;'>\n" +
                "    <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);'>\n" +
                "        <!-- Header -->\n" +
                "        <div style='background-color: #000; padding: 20px; text-align: center;'>\n" +
                "            <h1 style='color: #fff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;'>STRIVE</h1>\n" +
                "        </div>\n" +
                "        \n" +
                "        <!-- Content -->\n" +
                "        <div style='padding: 30px;'>\n" +
                "            <h2 style='margin-top: 0; color: #333;'>Order Confirmation</h2>\n" +
                "            <p>Hello " + firstName + ",</p>\n" +
                "            <p>Thank you for your order! We're pleased to confirm that your order has been received and is being processed.</p>\n" +
                "            \n" +
                "            <!-- Order Summary Box -->\n" +
                "            <div style='background-color: #f5f5f5; border-radius: 6px; padding: 20px; margin: 20px 0;'>\n" +
                "                <h3 style='margin-top: 0; color: #333; font-size: 18px;'>Order Summary</h3>\n" +
                "                <p style='margin: 5px 0; font-size: 15px;'><strong>Order Number:</strong> #" + orderId + "</p>\n" +
                "                <p style='margin: 5px 0; font-size: 15px;'><strong>Order Date:</strong> " + formattedDate + "</p>\n" +
                "                <p style='margin: 5px 0; font-size: 15px;'><strong>Total Amount:</strong> $" + totalAmount + "</p>\n" +
                "            </div>\n" +
                "            \n" +
                "            <!-- Order Items -->\n" +
                "            <h3 style='color: #333; font-size: 18px;'>Order Items</h3>\n" +
                "            <table style='width: 100%; border-collapse: collapse;'>\n" +
                "                <thead>\n" +
                "                    <tr style='background-color: #f5f5f5;'>\n" +
                "                        <th style='padding: 10px; text-align: center; width: 80px;'>Image</th>\n" +
                "                        <th style='padding: 10px; text-align: left;'>Product</th>\n" +
                "                        <th style='padding: 10px; text-align: center;'>Qty</th>\n" +
                "                        <th style='padding: 10px; text-align: right;'>Price</th>\n" +
                "                    </tr>\n" +
                "                </thead>\n" +
                "                <tbody>\n" +
                "                    " + itemsHtml.toString() + "\n" +
                "                </tbody>\n" +
                "                <tfoot>\n" +
                "                    <tr>\n" +
                "                        <td colspan='3' style='padding: 15px; text-align: right; font-weight: bold;'>Total:</td>\n" +
                "                        <td style='padding: 15px; text-align: right; font-weight: bold;'>$" + totalAmount + "</td>\n" +
                "                    </tr>\n" +
                "                </tfoot>\n" +
                "            </table>\n" +
                "            \n" +
                "            <!-- Call to Action -->\n" +
                "            <div style='text-align: center; margin: 30px 0;'>\n" +
                "                <a href='" + frontendUrl + "/orders' style='background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;'>View Order Details</a>\n" +
                "            </div>\n" +
                "            \n" +
                "            <p>If you have any questions about your order, please contact our customer support team.</p>\n" +
                "            <p>Thank you for shopping with Strive!</p>\n" +
                "            <p>Best regards,<br>The Strive Team</p>\n" +
                "        </div>\n" +
                "        \n" +
                "        <!-- Footer -->\n" +
                "        <div style='background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;'>\n" +
                "            <p>&copy; " + java.time.Year.now().getValue() + " Strive. All rights reserved.</p>\n" +
                "            <p>\n" +
                "                <a href='" + frontendUrl + "/privacy-policy' style='color: #666; text-decoration: underline; margin: 0 10px;'>Privacy Policy</a>\n" +
                "                <a href='" + frontendUrl + "/terms' style='color: #666; text-decoration: underline; margin: 0 10px;'>Terms of Service</a>\n" +
                "                <a href='" + frontendUrl + "/contact' style='color: #666; text-decoration: underline; margin: 0 10px;'>Contact Us</a>\n" +
                "            </p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
            
            sendHtmlEmail(to, subject, htmlContent);
        
        } catch (Exception e) {
            log.error("Failed to send HTML order confirmation email: {}", e.getMessage(), e);
            // Fallback to plain text email if HTML email fails
            sendOrderConfirmationEmail(to, firstName, orderId, totalAmount);
        }
    }

    @Override
    public void sendEmail(String to, String subject, String text) {
        try {
            log.info("Sending email to: {}", to);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail != null ? fromEmail : "strive.onlineshop@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            emailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
            throw e;
        }
    }
    
    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            log.info("Sending HTML email to: {}", to);
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail != null ? fromEmail : "strive.onlineshop@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            // Add logo image if needed
            // helper.addInline("logo", new ClassPathResource("static/images/logo.png"));
            
            emailSender.send(message);
            log.info("HTML email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send HTML email to: {}", to, e);
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }
} 