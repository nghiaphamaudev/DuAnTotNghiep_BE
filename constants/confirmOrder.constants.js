export function templateConfirmOrder1(
  nameUser,
  orderId,
  orderDate,
  totalPrice,
  products
) {
  return ` <div class="container">
         <p>${nameUser} thân mến !,</p>

         <p>Cảm ơn bạn đã đặt hàng tại FShirt! Chúng tôi rất vui được thông báo rằng đơn hàng của bạn đã được đặt thành công.</p>

         <p>Thông tin đơn hàng của bạn:</p>

         <p>Mã đơn hàng: ${orderId}</p>
         <p>Ngày đặt hàng: ${orderDate}</p>
         <p>Tổng tiền: ${totalPrice}</p>
        <p>Danh sách sản phẩm:</p>

        <table border="1" style="border-collapse: collapse; width: 100%">
             <thead>
                 <tr>
                     <th style="padding: 6px 12px;">Sản phẩm</th>
                     <th style="padding: 6px 12px;">Số lượng</th>
                     <th style="padding: 6px 12px;">Đơn giá</th>
                     <th style="padding: 6px 12px;">Thành tiền</th>
                 </tr>
             </thead>

             <tbody>
                 ${products
                   .map(
                     (it) => `<tr>
                     <td style="padding: 6px 12px;">
                         <p>Tên sản phẩm : ${it.name}</p>
                         <p>Màu: ${it.color}</p>
                         <p>Size: ${it.size}</p>

                     </td>
                     <td style="padding: 6px 12px;">${it.quantity}</td>
                     <td style="padding: 6px 12px;">${it.price}</td>
                     <td style="padding: 6px 12px;">${
                       it.quantity * it.price
                     }</td>
                 </tr>`
                   )
                   .join('')}
             </tbody>
        </table>

         <p>Chúng tôi sẽ sớm tiến hành xử lý đơn hàng của bạn và sẽ gửi cho bạn thông tin chi tiết về quá trình giao hàng trong thời gian sớm nhất.</p>

         <p>Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ thêm, xin vui lòng liên hệ với đội ngũ hỗ trợ khách hàng của chúng tôi qua email support@fshirt.com hoặc số điện thoại 0983.983.983.</p>

         <p>Một lần nữa, xin chân thành cảm ơn bạn đã tin tưởng và mua sắm tại FShirt. Chúc bạn một ngày tốt lành!</p>

         <p>Trân trọng,</p>

         <p>FShirt</p>

         <p>Thông tin liên hệ:</p>

         <p>Địa chỉ: Trịnh Văn Bô, Nam Từ Liêm, HN</p>
         <p>Email: contact@fshirt.com</p>
         <p>Số điện thoại: 0983.983.983</p>
      </div>`;
}

export const templateConfirmOrder2 = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
 html,
         body {
             margin: 0 !important;
             padding: 0 !important;
             min-height: 100% !important;
             width: 100% !important;
             -webkit-font-smoothing: antialiased;
         }
 
         * {
             -ms-text-size-adjust: 100%;
         }
 
         #outlook a {
             padding: 0;
         }
 
         .ReadMsgBody,
         .ExternalClass {
             width: 100%;
         }
 
         .ExternalClass,
         .ExternalClass p,
         .ExternalClass td,
         .ExternalClass div,
         .ExternalClass span,
         .ExternalClass font {
             line-height: 100%;
         }
 
         table,
         td,
         th {
             mso-table-lspace: 0 !important;
             mso-table-rspace: 0 !important;
             border-collapse: collapse;
         }
 
         u + .body table, u + .body td, u + .body th {
             will-change: transform;
         }
 
         body, td, th, p, div, li, a, span {
             -webkit-text-size-adjust: 100%;
             -ms-text-size-adjust: 100%;
             mso-line-height-rule: exactly;
         }
 
         img {
             border: 0;
             outline: 0;
             line-height: 100%;
             text-decoration: none;
             -ms-interpolation-mode: bicubic;
         }
 
         a[x-apple-data-detectors] {
             color: inherit !important;
             text-decoration: none !important;
         }
 
         .pc-gmail-fix {
             display: none;
             display: none !important;
         }
 
         .body .pc-project-body {
             background-color: transparent !important;
         }
 
         @media (min-width: 621px) {
             .pc-lg-hide {
                 display: none;
             } 
 
             .pc-lg-bg-img-hide {
                 background-image: none !important;
             }
         }
 </style>
 <style>
 @media (max-width: 620px) {
 .pc-project-body {min-width: 0px !important;}
 .pc-project-container {width: 100% !important;}
 .pc-sm-hide {display: none !important;}
 .pc-sm-bg-img-hide {background-image: none !important;}
 table.pc-w620-spacing-0-0-28-0 {margin: 0px 0px 28px 0px !important;}
 td.pc-w620-spacing-0-0-28-0,th.pc-w620-spacing-0-0-28-0{margin: 0 !important;padding: 0px 0px 28px 0px !important;}
 .pc-w620-padding-0-0-0-0 {padding: 0px 0px 0px 0px !important;}
 .pc-w620-width-100 {width: 100px !important;}
 .pc-w620-height-auto {height: auto !important;}
 .pc-w620-fontSize-30 {font-size: 30px !important;}
 .pc-w620-lineHeight-40 {line-height: 40px !important;}
 table.pc-w620-spacing-0-0-12-0 {margin: 0px 0px 12px 0px !important;}
 td.pc-w620-spacing-0-0-12-0,th.pc-w620-spacing-0-0-12-0{margin: 0 !important;padding: 0px 0px 12px 0px !important;}
 .pc-w620-fontSize-15px {font-size: 15px !important;}
 .pc-w620-lineHeight-140pc {line-height: 140% !important;}
 table.pc-w620-spacing-0-0-24-0 {margin: 0px 0px 24px 0px !important;}
 td.pc-w620-spacing-0-0-24-0,th.pc-w620-spacing-0-0-24-0{margin: 0 !important;padding: 0px 0px 24px 0px !important;}
 .pc-w620-itemsSpacings-8-12 {padding-left: 4px !important;padding-right: 4px !important;padding-top: 6px !important;padding-bottom: 6px !important;}
 
 .pc-w620-width-hug {width: auto !important;}
 .pc-w620-padding-16-12-16-12 {padding: 16px 12px 16px 12px !important;}
 table.pc-w620-spacing-0-0-0-0 {margin: 0px 0px 0px 0px !important;}
 td.pc-w620-spacing-0-0-0-0,th.pc-w620-spacing-0-0-0-0{margin: 0 !important;padding: 0px 0px 0px 0px !important;}
 .pc-w620-width-32 {width: 32px !important;}
 table.pc-w620-spacing-0-0-8-0 {margin: 0px 0px 8px 0px !important;}
 td.pc-w620-spacing-0-0-8-0,th.pc-w620-spacing-0-0-8-0{margin: 0 !important;padding: 0px 0px 8px 0px !important;}
 .pc-w620-fontSize-14px {font-size: 14px !important;}
 .pc-w620-width-80 {width: 80px !important;}
 .pc-w620-width-fill {width: 100% !important;}
 .pc-w620-fontSize-17px {font-size: 17px !important;}
 .pc-w620-padding-12-20-12-20 {padding: 12px 20px 12px 20px !important;}
 .pc-w620-width-100pc {width: 100% !important;}
 .pc-w620-padding-30-28-30-28 {padding: 30px 28px 30px 28px !important;}
 .pc-w620-fontSize-30px {font-size: 30px !important;}
 .pc-w620-itemsSpacings-0-30 {padding-left: 0px !important;padding-right: 0px !important;padding-top: 15px !important;padding-bottom: 15px !important;}
 .pc-w620-view-vertical,.pc-w620-view-vertical > tbody,.pc-w620-view-vertical > tbody > tr,.pc-w620-view-vertical > tbody > tr > th,.pc-w620-view-vertical > tr,.pc-w620-view-vertical > tr > th {display: inline-block;width: 100% !important;}
 .pc-w620-width-150 {width: 150px !important;}
 .pc-w620-height-100pc {height: 100% !important;}
 .pc-w620-fontSize-16 {font-size: 16px !important;}
 .pc-w620-padding-0-0-12-0 {padding: 0px 0px 12px 0px !important;}
 .pc-w620-valign-bottom {vertical-align: bottom !important;}
 td.pc-w620-halign-right,th.pc-w620-halign-right {text-align: right !important;}
 table.pc-w620-halign-right {float: none !important;margin-right: 0 !important;margin-left: auto !important;}
 img.pc-w620-halign-right {margin-right: 0 !important;margin-left: auto !important;}
 div.pc-w620-align-right,th.pc-w620-align-right,a.pc-w620-align-right,td.pc-w620-align-right {text-align: right !important;text-align-last: right !important;}
 table.pc-w620-align-right{float: none !important;margin-left: auto !important;margin-right: 0 !important;}
 img.pc-w620-align-right{margin-right: 0 !important;margin-left: auto !important;}
 .pc-w620-padding-16-0-12-0 {padding: 16px 0px 12px 0px !important;}
 table.pc-w620-spacing-0-0-20-0 {margin: 0px 0px 20px 0px !important;}
 td.pc-w620-spacing-0-0-20-0,th.pc-w620-spacing-0-0-20-0{margin: 0 !important;padding: 0px 0px 20px 0px !important;}
 .pc-w620-fontSize-16px {font-size: 16px !important;}
 .pc-w620-padding-12-0-12-0 {padding: 12px 0px 12px 0px !important;}
 .pc-w620-valign-middle {vertical-align: middle !important;}
 td.pc-w620-halign-left,th.pc-w620-halign-left {text-align: left !important;}
 table.pc-w620-halign-left {float: none !important;margin-right: auto !important;margin-left: 0 !important;}
 img.pc-w620-halign-left {margin-right: auto !important;margin-left: 0 !important;}
 .pc-w620-padding-16-0-0-0 {padding: 16px 0px 0px 0px !important;}
 div.pc-w620-align-left,th.pc-w620-align-left,a.pc-w620-align-left,td.pc-w620-align-left {text-align: left !important;text-align-last: left !important;}
 table.pc-w620-align-left{float: none !important;margin-right: auto !important;margin-left: 0 !important;}
 img.pc-w620-align-left{margin-right: auto !important;margin-left: 0 !important;}
 table.pc-w620-spacing-0-0-4-0 {margin: 0px 0px 4px 0px !important;}
 td.pc-w620-spacing-0-0-4-0,th.pc-w620-spacing-0-0-4-0{margin: 0 !important;padding: 0px 0px 4px 0px !important;}
 .pc-w620-itemsSpacings-0-20 {padding-left: 0px !important;padding-right: 0px !important;padding-top: 10px !important;padding-bottom: 10px !important;}
 .pc-w620-padding-28-28-28-28 {padding: 28px 28px 28px 28px !important;}
 .pc-w620-itemsSpacings-0-15 {padding-left: 0px !important;padding-right: 0px !important;padding-top: 7.5px !important;padding-bottom: 7.5px !important;}
 .pc-w620-itemsSpacings-0-12 {padding-left: 0px !important;padding-right: 0px !important;padding-top: 6px !important;padding-bottom: 6px !important;}
 .pc-w620-itemsSpacings-0-28 {padding-left: 0px !important;padding-right: 0px !important;padding-top: 14px !important;padding-bottom: 14px !important;}
 .pc-w620-itemsSpacings-20-0 {padding-left: 10px !important;padding-right: 10px !important;padding-top: 0px !important;padding-bottom: 0px !important;}
 .pc-w620-itemsSpacings-4-30 {padding-left: 2px !important;padding-right: 2px !important;padding-top: 15px !important;padding-bottom: 15px !important;}
 .pc-w620-padding-35-35-35-35 {padding: 35px 35px 35px 35px !important;}
 
 .pc-w620-gridCollapsed-1 > tbody,.pc-w620-gridCollapsed-1 > tbody > tr,.pc-w620-gridCollapsed-1 > tr {display: inline-block !important;}
 .pc-w620-gridCollapsed-1.pc-width-fill > tbody,.pc-w620-gridCollapsed-1.pc-width-fill > tbody > tr,.pc-w620-gridCollapsed-1.pc-width-fill > tr {width: 100% !important;}
 .pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody > tr,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tr {width: 100% !important;}
 .pc-w620-gridCollapsed-1 > tbody > tr > td,.pc-w620-gridCollapsed-1 > tr > td {display: block !important;width: auto !important;padding-left: 0 !important;padding-right: 0 !important;margin-left: 0 !important;}
 .pc-w620-gridCollapsed-1.pc-width-fill > tbody > tr > td,.pc-w620-gridCollapsed-1.pc-width-fill > tr > td {width: 100% !important;}
 .pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody > tr > td,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tr > td {width: 100% !important;}
 .pc-w620-gridCollapsed-1 > tbody > .pc-grid-tr-first > .pc-grid-td-first,pc-w620-gridCollapsed-1 > .pc-grid-tr-first > .pc-grid-td-first {padding-top: 0 !important;}
 .pc-w620-gridCollapsed-1 > tbody > .pc-grid-tr-last > .pc-grid-td-last,pc-w620-gridCollapsed-1 > .pc-grid-tr-last > .pc-grid-td-last {padding-bottom: 0 !important;}
 
 .pc-w620-gridCollapsed-0 > tbody > .pc-grid-tr-first > td,.pc-w620-gridCollapsed-0 > .pc-grid-tr-first > td {padding-top: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > .pc-grid-tr-last > td,.pc-w620-gridCollapsed-0 > .pc-grid-tr-last > td {padding-bottom: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > tr > .pc-grid-td-first,.pc-w620-gridCollapsed-0 > tr > .pc-grid-td-first {padding-left: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > tr > .pc-grid-td-last,.pc-w620-gridCollapsed-0 > tr > .pc-grid-td-last {padding-right: 0 !important;}
 
 .pc-w620-tableCollapsed-1 > tbody,.pc-w620-tableCollapsed-1 > tbody > tr,.pc-w620-tableCollapsed-1 > tr {display: block !important;}
 .pc-w620-tableCollapsed-1.pc-width-fill > tbody,.pc-w620-tableCollapsed-1.pc-width-fill > tbody > tr,.pc-w620-tableCollapsed-1.pc-width-fill > tr {width: 100% !important;}
 .pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody > tr,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tr {width: 100% !important;}
 .pc-w620-tableCollapsed-1 > tbody > tr > td,.pc-w620-tableCollapsed-1 > tr > td {display: block !important;width: auto !important;}
 .pc-w620-tableCollapsed-1.pc-width-fill > tbody > tr > td,.pc-w620-tableCollapsed-1.pc-width-fill > tr > td {width: 100% !important;box-sizing: border-box !important;}
 .pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody > tr > td,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tr > td {width: 100% !important;box-sizing: border-box !important;}
 }
 @media (max-width: 520px) {
 .pc-w520-padding-30-30-30-30 {padding: 30px 30px 30px 30px !important;}
 }
 </style>
 <style>
 @font-face { font-family: 'Hanken Grotesk'; font-style: normal; font-weight: 400; src: url('https://fonts.gstatic.com/s/hankengrotesk/v8/ieVq2YZDLWuGJpnzaiwFXS9tYvBRzyFLlZg_f_Ncs2Zq6PBK.woff') format('woff'), url('https://fonts.gstatic.com/s/hankengrotesk/v8/ieVq2YZDLWuGJpnzaiwFXS9tYvBRzyFLlZg_f_Ncs2Zq6PBM.woff2') format('woff2'); } @font-face { font-family: 'Hanken Grotesk'; font-style: normal; font-weight: 700; src: url('https://fonts.gstatic.com/s/hankengrotesk/v8/ieVq2YZDLWuGJpnzaiwFXS9tYvBRzyFLlZg_f_NcVGFq6PBK.woff') format('woff'), url('https://fonts.gstatic.com/s/hankengrotesk/v8/ieVq2YZDLWuGJpnzaiwFXS9tYvBRzyFLlZg_f_NcVGFq6PBM.woff2') format('woff2'); } @font-face { font-family: 'Hanken Grotesk'; font-style: normal; font-weight: 500; src: url('https://fonts.gstatic.com/s/hankengrotesk/v8/ieVq2YZDLWuGJpnzaiwFXS9tYvBRzyFLlZg_f_NcgWZq6PBK.woff') format('woff'), url('https://fonts.gstatic.com/s/hankengrotesk/v8/ieVq2YZDLWuGJpnzaiwFXS9tYvBRzyFLlZg_f_NcgWZq6PBM.woff2') format('woff2'); } @font-face { font-family: 'Hanken Grotesk'; font-style: normal; font-weight: 600; src: url('https://fonts.gstatic.com/s/hankengrotesk/v8/ieVq2YZDLWuGJpnzaiwFXS9tYvBRzyFLlZg_f_NcbWFq6PBK.woff') format('woff'), url('https://fonts.gstatic.com/s/hankengrotesk/v8/ieVq2YZDLWuGJpnzaiwFXS9tYvBRzyFLlZg_f_NcbWFq6PBM.woff2') format('woff2'); }
 </style>
</head>
<body class="body pc-font-alt" style="width: 100% !important; min-height: 100% !important; margin: 0 !important; padding: 0 !important; line-height: 1.5; color: #2D3A41; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-variant-ligatures: normal; text-rendering: optimizeLegibility; -moz-osx-font-smoothing: grayscale; background-color: #f3e5ff;" bgcolor="#f3e5ff">
 <table class="pc-project-body" style="table-layout: fixed; min-width: 600px; background-color: #f3e5ff;" bgcolor="#f3e5ff" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
  <tr>
   <td align="center" valign="top">
    <table class="pc-project-container" align="center" width="600" style="width: 600px; max-width: 600px;" border="0" cellpadding="0" cellspacing="0" role="presentation">
     <tr>
      <td style="padding: 20px 0px 20px 0px;" align="left" valign="top">
       <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="width: 100%;">
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Header -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-30-28-30-28" style="padding: 40px 40px 40px 40px; border-radius: 2px 2px 0px 0px; background-color: #53335d;" bgcolor="#53335d">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-spacing-0-0-28-0" align="center" valign="top" style="padding: 0px 0px 40px 0px;">
                   <img src="https://res.cloudinary.com/dyv5zfnit/image/upload/v1732099443/email/66b166144d015edbc2ce578ad3e5f07c_iiasdy.png" class="pc-w620-width-100 pc-w620-height-auto" width="150" height="35" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; object-fit: contain; width: 150px; height: auto; max-width: 100%; border: 0;" />
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-spacing-0-0-12-0" align="center" valign="top" style="padding: 0px 0px 16px 0px;">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                    <tr>
                     <td valign="top" class="pc-w620-padding-0-0-0-0" align="center" style="padding: 0px 40px 0px 40px;">
                      <div class="pc-font-alt pc-w620-fontSize-30 pc-w620-lineHeight-40" style="line-height: 90%; letter-spacing: -0.03em; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 72px; font-weight: bold; font-variant-ligatures: normal; color: #f5c04d; text-align: center; text-align-last: center;">
                       <div><span>Your order is on the way!</span>
                       </div>
                      </div>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-spacing-0-0-24-0" align="center" valign="top" style="padding: 0px 0px 28px 0px;">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                    <tr>
                     <td valign="top" class="pc-w620-padding-0-0-0-0" align="center" style="padding: 0px 0px 0px 0px;">
                      <div class="pc-font-alt pc-w620-fontSize-15px pc-w620-lineHeight-140pc" style="line-height: 160%; letter-spacing: -0.6px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: normal; font-variant-ligatures: normal; color: #ffffffcc; text-align: center; text-align-last: center;">
                       <div><span>Great news! Your order is all set to hit the road. We&#39;re packing it up with care and it&#39;ll be on its way to you in no time.</span>
                       </div>
                      </div>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td style="padding: 0px 0px 41px 0px;">
                   <table class="pc-width-fill pc-w620-gridCollapsed-0 pc-w620-width-hug" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr class="pc-grid-tr-first pc-grid-tr-last">
                     <td class="pc-grid-td-first pc-w620-itemsSpacings-8-12" align="center" valign="middle" style="width: 33.333333333333%; padding-top: 0px; padding-right: 6px; padding-bottom: 0px; padding-left: 0px;">
                      <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td class="pc-w620-padding-16-12-16-12" align="center" valign="middle" style="padding: 20px 20px 20px 20px; background-color: #6a4476; border-radius: 8px 8px 8px 8px;">
                         <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="center" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td class="pc-w620-spacing-0-0-8-0" align="center" valign="top" style="padding: 0px 0px 12px 0px;">
                               <img src="https://res.cloudinary.com/dyv5zfnit/image/upload/v1732099443/email/58d6e995af1dc9bb85777d48ef698ba4_idgexm.png" class="pc-w620-width-32 pc-w620-height-auto" width="60" height="59" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; object-fit: contain; width: 60px; height: auto; max-width: 100%; border-radius: 8px; border: 0;" />
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table class="pc-w620-width-80" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td class="pc-w620-spacing-0-0-0-0" valign="top" style="padding: 0px 0px 10px 0px;">
                               <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                <tr>
                                 <td valign="top" class="pc-w620-padding-0-0-0-0" align="center">
                                  <div class="pc-font-alt pc-w620-fontSize-14px" style="line-height: 142%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: normal; font-variant-ligatures: normal; color: #ffffff; text-align: center; text-align-last: center;">
                                   <div><span>Confirmed</span>
                                   </div>
                                  </div>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                     <td class="pc-w620-itemsSpacings-8-12" align="center" valign="middle" style="width: 33.333333333333%; padding-top: 0px; padding-right: 6px; padding-bottom: 0px; padding-left: 6px;">
                      <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td class="pc-w620-padding-16-12-16-12" align="center" valign="middle" style="padding: 20px 20px 20px 20px; background-color: #6a4476; border-radius: 8px 8px 8px 8px;">
                         <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="center" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td class="pc-w620-spacing-0-0-8-0" align="center" valign="top" style="padding: 0px 0px 12px 0px;">
                               <img src="https://res.cloudinary.com/dyv5zfnit/image/upload/v1732099443/email/ee7587a7a91d1d13a23e640307d512fe_h4gvn3.png" class="pc-w620-width-32 pc-w620-height-auto" width="60" height="60" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; object-fit: contain; width: 60px; height: auto; max-width: 100%; border-radius: 8px; border: 0;" />
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table class="pc-w620-width-80" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td class="pc-w620-spacing-0-0-0-0" valign="top" style="padding: 0px 0px 10px 0px;">
                               <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                <tr>
                                 <td valign="top" class="pc-w620-padding-0-0-0-0" align="center">
                                  <div class="pc-font-alt pc-w620-fontSize-14px" style="line-height: 142%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: normal; font-variant-ligatures: normal; color: #ffffff99; text-align: center; text-align-last: center;">
                                   <div><span>Shipping</span>
                                   </div>
                                  </div>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                     <td class="pc-grid-td-last pc-w620-itemsSpacings-8-12" align="center" valign="middle" style="width: 33.333333333333%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 6px;">
                      <table class="pc-w620-width-fill" style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td class="pc-w620-padding-16-12-16-12" align="center" valign="middle" style="padding: 20px 20px 20px 20px; background-color: #6a4476; border-radius: 8px 8px 8px 8px;">
                         <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="center" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td class="pc-w620-spacing-0-0-8-0" align="center" valign="top" style="padding: 0px 0px 12px 0px;">
                               <img src="https://res.cloudinary.com/dyv5zfnit/image/upload/v1732099444/email/b0d03ad328483a5b0a93bf66b6be6745_yekujk.png" class="pc-w620-width-32 pc-w620-height-auto" width="60" height="60" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; object-fit: contain; width: 60px; height: auto; max-width: 100%; border-radius: 8px; border: 0;" />
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table class="pc-w620-width-80" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td class="pc-w620-spacing-0-0-0-0" valign="top" style="padding: 0px 0px 10px 0px;">
                               <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                <tr>
                                 <td valign="top" class="pc-w620-padding-0-0-0-0" align="center">
                                  <div class="pc-font-alt pc-w620-fontSize-14px" style="line-height: 142%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: normal; font-variant-ligatures: normal; color: #ffffff99; text-align: center; text-align-last: center;">
                                   <div><span>Delivered</span>
                                   </div>
                                  </div>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <th valign="top" class="pc-w620-spacing-0-0-0-0" align="center" style="padding: 0px 0px 0px 0px; text-align: center; font-weight: normal; line-height: 1;">
                   <!--[if mso]>
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-width-100pc" align="center" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
            <tr>
                <td valign="middle" align="center" style="border-radius: 134px 134px 134px 134px; background-color: #f5c04e; text-align:center; color: #ffffff; padding: 16px 32px 16px 32px; mso-padding-left-alt: 0; margin-left:32px;" bgcolor="#f5c04e">
                                    <a class="pc-font-alt" style="display: inline-block; text-decoration: none; font-variant-ligatures: normal; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-weight: 600; font-size: 18px; line-height: 150%; letter-spacing: -0.2px; text-align: center; color: #27142d;" href="https://postcards.email/" target="_blank"><span style="display: block;"><span>Track your order</span></span></a>
                                </td>
            </tr>
        </table>
        <![endif]-->
                   <!--[if !mso]><!-- -->
                   <a class="pc-w620-width-100pc pc-w620-fontSize-17px pc-w620-padding-12-20-12-20" style="display: inline-block; box-sizing: border-box; border-radius: 134px 134px 134px 134px; background-color: #f5c04e; padding: 16px 32px 16px 32px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-weight: 600; font-size: 18px; line-height: 150%; letter-spacing: -0.2px; color: #27142d; vertical-align: top; text-align: center; text-align-last: center; text-decoration: none; -webkit-text-size-adjust: none;" href="https://postcards.email/" target="_blank"><span style="display: block;"><span>Track your order</span></span></a>
                   <!--<![endif]-->
                  </th>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Header -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Order Details -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-28-28-28-28" style="padding: 40px 40px 0px 40px; border-radius: 0px; background-color: #ffffff;" bgcolor="#ffffff">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-spacing-0-0-12-0" align="center" valign="top" style="padding: 0px 0px 12px 0px;">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                    <tr>
                     <td valign="top" class="pc-w620-padding-0-0-0-0" align="center" style="padding: 0px 0px 0px 0px;">
                      <div class="pc-font-alt pc-w620-fontSize-30px pc-w620-lineHeight-140pc" style="line-height: 128%; letter-spacing: -0.01em; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 34px; font-weight: bold; font-variant-ligatures: normal; color: #27142d; text-align: center; text-align-last: center;">
                       <div><span>Order Details</span>
                       </div>
                      </div>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-spacing-0-0-24-0" align="center" style="padding: 0px 0px 32px 0px;">
                   <table class="pc-width-hug pc-w620-gridCollapsed-1" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr class="pc-grid-tr-first pc-grid-tr-last">
                     <td class="pc-grid-td-first pc-grid-td-last pc-w620-itemsSpacings-0-30" valign="middle" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                      <table style="border-collapse: separate; border-spacing: 0;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td align="center" valign="middle">
                         <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td valign="top" style="padding: 0px 0px 0px 0px;">
                               <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                <tr>
                                 <td valign="top" align="center" style="padding: 0px 0px 0px 0px;">
                                  <div class="pc-font-alt pc-w620-fontSize-15px" style="line-height: 121%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: normal; font-variant-ligatures: normal; color: #99959b; text-align: center; text-align-last: center;">
                                   <div><span>Order Confirmation Number: </span><span style="font-weight: 600;font-style: normal;color: rgb(83, 51, 93);">#0090890</span>
                                   </div>
                                  </div>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td style="padding: 0px 0px 16px 0px; ">
                   <table class="pc-w620-tableCollapsed-0" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                    <tbody>
                     <tr>
                      <td align="left" valign="top" style="padding: 0px 0px 12px 0px; border-bottom: 1px solid #e5e5e5;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-spacing-0-0-0-0" valign="top" style="padding: 0px 0px 12px 0px;">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td class="pc-w620-padding-0-0-0-0" valign="top" style="padding: 0px 0px 0px 0px;">
                             <table class="pc-w620-view-vertical" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                               <th valign="top" style="font-weight: normal; text-align: left;">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                 <tr>
                                  <td class="pc-w620-spacing-0-0-12-0" valign="top" style="padding: 0px 20px 0px 0px;">
                                   <img src="images/image-17320967895824.png" class="pc-w620-width-150 pc-w620-height-100pc" width="100" height="100" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 100px; height: 100%; border: 0;" />
                                  </td>
                                 </tr>
                                </table>
                               </th>
                               <th valign="top" style="font-weight: normal; text-align: left;">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                 <tr>
                                  <td>
                                   <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                     <td valign="top">
                                      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <th align="left" valign="top" style="font-weight: normal; text-align: left; padding: 0px 0px 8px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                          <tr>
                                           <td valign="top" align="left" style="padding: 0px 0px 0px 0px;">
                                            <div class="pc-font-alt pc-w620-fontSize-16 pc-w620-lineHeight-140pc" style="line-height: 140%; letter-spacing: -0.3px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                             <div><span>Boys Blue Boat Basic Long Nevodo Sweatshirt </span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </th>
                                       </tr>
                                       <tr>
                                        <th align="left" valign="top" style="font-weight: normal; text-align: left; padding: 0px 0px 4px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                          <tr>
                                           <td valign="top" align="left" style="padding: 0px 0px 0px 0px;">
                                            <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #99959b; text-align: left; text-align-last: left;">
                                             <div><span>SKU : 79693985 </span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </th>
                                       </tr>
                                       <tr>
                                        <th align="left" valign="top" style="font-weight: normal; text-align: left;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                          <tr>
                                           <td valign="top" align="left">
                                            <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #99959b; text-align: left; text-align-last: left;">
                                             <div><span>Size : 4y</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </th>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                   </table>
                                  </td>
                                 </tr>
                                </table>
                               </th>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                      <td class="pc-w620-halign-right pc-w620-valign-bottom pc-w620-padding-0-0-12-0" align="right" valign="bottom" style="padding: 0px 0px 12px 0px; border-bottom: 1px solid #e5e5e5;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-spacing-0-0-0-0" valign="top" style="padding: 0px 0px 12px 0px;">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td class="pc-w620-padding-0-0-0-0 pc-w620-align-right" valign="top" align="right" style="padding: 0px 0px 0px 0px;">
                             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                               <th class="pc-w620-align-right" align="right" valign="top" style="font-weight: normal; text-align: left;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-align-right" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                 <tr>
                                  <td valign="top" class="pc-w620-align-right" align="right">
                                   <div class="pc-font-alt pc-w620-align-right pc-w620-fontSize-14px" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 600; font-variant-ligatures: normal; color: #53335d; text-align: right; text-align-last: right;">
                                    <div><span>$36.00</span>
                                    </div>
                                   </div>
                                  </td>
                                 </tr>
                                </table>
                               </th>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                     </tr>
                     <tr>
                      <td class="pc-w620-padding-16-0-12-0" align="left" valign="top" style="padding: 12px 0px 12px 0px; border-bottom: 1px solid #e5e5e5;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-spacing-0-0-0-0" valign="top" style="padding: 12px 0px 12px 0px;">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td class="pc-w620-padding-0-0-0-0" valign="top" style="padding: 0px 0px 0px 0px;">
                             <table class="pc-w620-view-vertical" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                               <th valign="top" style="font-weight: normal; text-align: left;">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                 <tr>
                                  <td class="pc-w620-spacing-0-0-20-0" valign="top" style="padding: 0px 20px 0px 0px;">
                                   <img src="images/image-17320967895985.png" class="pc-w620-width-150 pc-w620-height-100pc" width="100" height="100" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 100px; height: 100%; border: 0;" />
                                  </td>
                                 </tr>
                                </table>
                               </th>
                               <th valign="top" style="font-weight: normal; text-align: left;">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                 <tr>
                                  <td>
                                   <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                     <td valign="top">
                                      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <th align="left" valign="top" style="font-weight: normal; text-align: left; padding: 0px 0px 8px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                          <tr>
                                           <td valign="top" align="left" style="padding: 0px 0px 0px 0px;">
                                            <div class="pc-font-alt pc-w620-fontSize-16px pc-w620-lineHeight-140pc" style="line-height: 140%; letter-spacing: -0.3px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                             <div><span>Baby Girls Off White Green Lebleu Long Sleeves Dress</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </th>
                                       </tr>
                                       <tr>
                                        <th align="left" valign="top" style="font-weight: normal; text-align: left; padding: 0px 0px 4px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                          <tr>
                                           <td valign="top" align="left" style="padding: 0px 0px 0px 0px;">
                                            <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #99959b; text-align: left; text-align-last: left;">
                                             <div><span>SKU : 79678347 </span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </th>
                                       </tr>
                                       <tr>
                                        <th align="left" valign="top" style="font-weight: normal; text-align: left;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                          <tr>
                                           <td valign="top" align="left">
                                            <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #99959b; text-align: left; text-align-last: left;">
                                             <div><span>Size : 6m</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </th>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                   </table>
                                  </td>
                                 </tr>
                                </table>
                               </th>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                      <td class="pc-w620-halign-right pc-w620-valign-bottom pc-w620-padding-12-0-12-0" align="right" valign="bottom" style="padding: 12px 0px 12px 0px; border-bottom: 1px solid #e5e5e5;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-spacing-0-0-0-0" valign="top" style="padding: 0px 0px 0px 0px;">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td class="pc-w620-padding-0-0-0-0 pc-w620-align-right" valign="top" align="right" style="padding: 0px 0px 12px 0px;">
                             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                               <th class="pc-w620-align-right" align="right" valign="top" style="font-weight: normal; text-align: left;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-align-right" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                 <tr>
                                  <td valign="top" class="pc-w620-align-right" align="right">
                                   <div class="pc-font-alt pc-w620-align-right pc-w620-fontSize-14px" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 600; font-variant-ligatures: normal; color: #53335d; text-align: right; text-align-last: right;">
                                    <div><span>$24.00</span>
                                    </div>
                                   </div>
                                  </td>
                                 </tr>
                                </table>
                               </th>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                     </tr>
                     <tr align="right" valign="middle">
                      <td class="pc-w620-halign-left pc-w620-valign-middle pc-w620-padding-16-0-0-0" align="right" valign="middle" style="padding: 16px 0px 4px 0px;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td class="pc-w620-align-left" valign="top" align="left">
                             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                               <th class="pc-w620-align-left" align="left" valign="top" style="font-weight: normal; text-align: left; padding: 0px 0px 0px 0px;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-align-left" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                 <tr>
                                  <td valign="top" class="pc-w620-align-left" align="left" style="padding: 0px 0px 0px 0px;">
                                   <div class="pc-font-alt pc-w620-align-left pc-w620-fontSize-14px pc-w620-lineHeight-140pc" style="line-height: 140%; letter-spacing: -0.3px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                    <div><span>Subtotal (excl. promo)</span>
                                    </div>
                                   </div>
                                  </td>
                                 </tr>
                                </table>
                               </th>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                      <td class="pc-w620-halign-right pc-w620-valign-middle pc-w620-padding-16-0-0-0" align="right" valign="middle" style="padding: 16px 0px 4px 0px;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td class="pc-w620-align-right" valign="top" align="right">
                             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                               <th class="pc-w620-spacing-0-0-4-0 pc-w620-align-right" align="right" valign="top" style="font-weight: normal; text-align: left;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-align-right" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                 <tr>
                                  <td valign="top" class="pc-w620-padding-0-0-0-0 pc-w620-align-right" align="right">
                                   <div class="pc-font-alt pc-w620-align-right" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #53335d; text-align: right; text-align-last: right;">
                                    <div><span>$60.00</span>
                                    </div>
                                   </div>
                                  </td>
                                 </tr>
                                </table>
                               </th>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                     </tr>
                     <tr align="right" valign="middle">
                      <td class="pc-w620-halign-right pc-w620-valign-middle" align="right" valign="middle" style="padding: 4px 0px 4px 0px;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td class="pc-w620-align-left" valign="top" align="left">
                             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                               <th class="pc-w620-spacing-0-0-0-0 pc-w620-align-left" align="left" valign="top" style="font-weight: normal; text-align: left; padding: 0px 0px 0px 0px;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-align-left" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                 <tr>
                                  <td valign="top" class="pc-w620-padding-0-0-0-0 pc-w620-align-left" align="left" style="padding: 0px 0px 0px 0px;">
                                   <div class="pc-font-alt pc-w620-align-left pc-w620-fontSize-14px pc-w620-lineHeight-140pc" style="line-height: 140%; letter-spacing: -0.3px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                    <div><span>20% Off</span>
                                    </div>
                                   </div>
                                  </td>
                                 </tr>
                                </table>
                               </th>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                      <td class="pc-w620-halign-right pc-w620-valign-middle" align="right" valign="middle" style="padding: 4px 0px 4px 0px;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td class="pc-w620-align-right" valign="top" align="right">
                             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                               <th class="pc-w620-spacing-0-0-0-0 pc-w620-align-right" align="right" valign="top" style="font-weight: normal; text-align: left;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-align-right" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                 <tr>
                                  <td valign="top" class="pc-w620-padding-0-0-0-0 pc-w620-align-right" align="right">
                                   <div class="pc-font-alt pc-w620-align-right" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #53335d; text-align: right; text-align-last: right;">
                                    <div><span>-$12.00</span>
                                    </div>
                                   </div>
                                  </td>
                                 </tr>
                                </table>
                               </th>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                     </tr>
                     <tr align="right" valign="middle">
                      <td class="pc-w620-halign-right pc-w620-valign-middle" align="right" valign="middle" style="padding: 4px 0px 4px 0px;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td class="pc-w620-align-left" valign="top" align="left">
                             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                               <th class="pc-w620-spacing-0-0-0-0 pc-w620-align-left" align="left" valign="top" style="font-weight: normal; text-align: left; padding: 0px 0px 0px 0px;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-align-left" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                 <tr>
                                  <td valign="top" class="pc-w620-padding-0-0-0-0 pc-w620-align-left" align="left" style="padding: 0px 0px 0px 0px;">
                                   <div class="pc-font-alt pc-w620-align-left pc-w620-fontSize-14px pc-w620-lineHeight-140pc" style="line-height: 140%; letter-spacing: -0.3px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: normal; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                    <div><span>Total Paid</span>
                                    </div>
                                   </div>
                                  </td>
                                 </tr>
                                </table>
                               </th>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                      <td align="right" valign="middle" style="padding: 4px 0px 4px 0px;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td valign="top" align="right">
                             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                               <th class="pc-w620-spacing-0-0-0-0" align="right" valign="top" style="font-weight: normal; text-align: left;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                                 <tr>
                                  <td valign="top" class="pc-w620-padding-0-0-0-0" align="right">
                                   <div class="pc-font-alt pc-w620-fontSize-14px" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: normal; font-variant-ligatures: normal; color: #53335d; text-align: right; text-align-last: right;">
                                    <div><span>$48.00</span>
                                    </div>
                                   </div>
                                  </td>
                                 </tr>
                                </table>
                               </th>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                     </tr>
                    </tbody>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-spacing-0-0-24-0" style="padding: 0px 0px 32px 0px;">
                   <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr class="pc-grid-tr-first pc-grid-tr-last">
                     <td class="pc-grid-td-first pc-grid-td-last pc-w620-itemsSpacings-0-30" align="left" valign="top" style="width: 50%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                      <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td align="left" valign="top" style="padding: 20px 20px 20px 20px; background-color: #fdf1d8; border-radius: 12px 12px 12px 12px;">
                         <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="left" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td style="padding: 0px 0px 0px 0px;">
                               <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr class="pc-grid-tr-first pc-grid-tr-last">
                                 <td class="pc-grid-td-first pc-w620-itemsSpacings-0-20" align="left" valign="top" style="width: 50%; padding-top: 0px; padding-right: 20px; padding-bottom: 0px; padding-left: 0px;">
                                  <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="left" valign="top">
                                     <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="left" valign="top">
                                        <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td class="pc-w620-spacing-0-0-4-0" valign="top" style="padding: 0px 0px 8px 0px;">
                                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                            <tr>
                                             <td valign="top" class="pc-w620-padding-0-0-0-0" align="left" style="padding: 0px 0px 0px 0px;">
                                              <div class="pc-font-alt" style="line-height: 156%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                               <div><span>Shipping Address</span>
                                               </div>
                                              </div>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="left" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="left" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="left">
                                           <div class="pc-font-alt" style="line-height: 156%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                            <div><span>Smiles Davis Dessler</span>
                                            </div>
                                            <div><span>Unit 57 and 61-65, Warwickshire, CV11DX, UK </span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-grid-td-last pc-w620-itemsSpacings-0-20" align="left" valign="top" style="width: 50%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 20px;">
                                  <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="left" valign="top">
                                     <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="left" valign="top">
                                        <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td class="pc-w620-spacing-0-0-4-0" valign="top" style="padding: 0px 0px 8px 0px;">
                                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                            <tr>
                                             <td valign="top" class="pc-w620-padding-0-0-0-0" align="left" style="padding: 0px 0px 0px 0px;">
                                              <div class="pc-font-alt" style="line-height: 156%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                               <div><span>Billing Address</span>
                                               </div>
                                              </div>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="left" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="left" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="left">
                                           <div class="pc-font-alt" style="line-height: 156%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                            <div><span>Smiles Davis Dessler</span>
                                            </div>
                                            <div><span>18 Congleton Close, Coventry, CV66LH, UK </span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                 <tr>
                  <td valign="top">
                   <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                     <!--[if gte mso 9]>
                    <td height="1" valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 1px solid #e5e5e5;">&nbsp;</td>
                <![endif]-->
                     <!--[if !gte mso 9]><!-- -->
                     <td height="1" valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 1px solid #e5e5e5;">&nbsp;</td>
                     <!--<![endif]-->
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Order Details -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Contacts -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-28-28-28-28" style="padding: 40px 40px 40px 40px; border-radius: 0px; background-color: #f9f3fe;" bgcolor="#f9f3fe">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td style="padding: 0px 0px 8px 0px;">
                   <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr class="pc-grid-tr-first pc-grid-tr-last">
                     <td class="pc-grid-td-first pc-grid-td-last pc-w620-itemsSpacings-0-15" align="center" valign="middle" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                      <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td align="center" valign="middle">
                         <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="center" valign="top">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                             <tr>
                              <td valign="top" align="center">
                               <div class="pc-font-alt" style="line-height: 142%; letter-spacing: -0.01em; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 34px; font-weight: bold; font-variant-ligatures: normal; color: #27142d; text-align: center; text-align-last: center;">
                                <div><span>Do you have any concern ?</span>
                                </div>
                               </div>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-spacing-0-0-20-0" align="center" valign="top" style="padding: 0px 0px 24px 0px;">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                    <tr>
                     <td valign="top" class="pc-w620-padding-0-0-0-0" align="center" style="padding: 0px 0px 0px 0px;">
                      <div class="pc-font-alt pc-w620-fontSize-16px" style="line-height: 156%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #99959b; text-align: center; text-align-last: center;">
                       <div><span>Don&#39;t hesitate to contact us if you have any problems with your order.</span>
                       </div>
                      </div>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td>
                   <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr class="pc-grid-tr-first pc-grid-tr-last">
                     <td class="pc-grid-td-first pc-w620-itemsSpacings-0-12" align="left" valign="top" style="width: 50%; padding-top: 0px; padding-right: 8px; padding-bottom: 0px; padding-left: 0px;">
                      <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td align="left" valign="top" style="padding: 20px 16px 20px 16px; background-color: #f5e1ff; border-radius: 12px 12px 12px 12px;">
                         <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="left" valign="top">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td align="left">
                               <table class="pc-width-hug pc-w620-gridCollapsed-0" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr class="pc-grid-tr-first pc-grid-tr-last">
                                 <td class="pc-grid-td-first" valign="top" style="padding-top: 0px; padding-right: 8px; padding-bottom: 0px; padding-left: 0px;">
                                  <table style="border-collapse: separate; border-spacing: 0;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="left" valign="top">
                                     <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="left" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="left" valign="top">
                                           <img src="https://res.cloudinary.com/dyv5zfnit/image/upload/v1732099444/email/f15502045f28e419edb7be12fef9b14a_nxnayt.png" width="50" height="50" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; object-fit: contain; width: 50px; height: 50px; border-radius: 8px; border: 0;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-grid-td-last" valign="top" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 8px;">
                                  <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="left" valign="top">
                                     <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="left" valign="top">
                                        <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td valign="top" style="padding: 0px 0px 4px 0px;">
                                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                            <tr>
                                             <td valign="top" align="left" style="padding: 0px 0px 0px 0px;">
                                              <div class="pc-font-alt" style="line-height: 150%; letter-spacing: -0.1px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                               <div><span>Email Us</span>
                                               </div>
                                              </div>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="left" valign="top">
                                        <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td valign="top" style="padding: 0px 0px 0px 0px;">
                                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                            <tr>
                                             <td valign="top" align="left">
                                              <div class="pc-font-alt" style="line-height: 143%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                               <div><span>help@funzy.com</span>
                                               </div>
                                              </div>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                     <td class="pc-grid-td-last pc-w620-itemsSpacings-0-12" align="left" valign="top" style="width: 50%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 8px;">
                      <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td align="left" valign="top" style="padding: 20px 16px 20px 16px; background-color: #f5e1ff; border-radius: 12px 12px 12px 12px;">
                         <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="left" valign="top">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td align="left">
                               <table class="pc-width-hug pc-w620-gridCollapsed-0" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr class="pc-grid-tr-first pc-grid-tr-last">
                                 <td class="pc-grid-td-first" valign="top" style="padding-top: 0px; padding-right: 8px; padding-bottom: 0px; padding-left: 0px;">
                                  <table style="border-collapse: separate; border-spacing: 0;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="left" valign="top">
                                     <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="left" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="left" valign="top">
                                           <img src="https://res.cloudinary.com/dyv5zfnit/image/upload/v1732099443/email/b6a976c3e3c27a9f1eff53cbc278ecab_hpntbo.png" width="50" height="50" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; object-fit: contain; width: 50px; height: 50px; border-radius: 8px; border: 0;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-grid-td-last" valign="top" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 8px;">
                                  <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="left" valign="top">
                                     <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="left" valign="top">
                                        <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td valign="top" style="padding: 0px 0px 4px 0px;">
                                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                            <tr>
                                             <td valign="top" align="left" style="padding: 0px 0px 0px 0px;">
                                              <div class="pc-font-alt" style="line-height: 150%; letter-spacing: -0.1px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                               <div><span>Phone Us</span>
                                               </div>
                                              </div>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="left" valign="top">
                                        <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td valign="top" style="padding: 0px 0px 0px 0px;">
                                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                            <tr>
                                             <td valign="top" align="left">
                                              <div class="pc-font-alt" style="line-height: 143%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #27142d; text-align: left; text-align-last: left;">
                                               <div><span>1 (999) 928-2938</span>
                                               </div>
                                              </div>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Contacts -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Footer -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w520-padding-30-30-30-30 pc-w620-padding-35-35-35-35" style="padding: 40px 40px 40px 40px; border-radius: 0px 0px 2px 2px; background-color: #53335d;" bgcolor="#53335d">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td>
                   <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr class="pc-grid-tr-first">
                     <td class="pc-grid-td-first pc-grid-td-last pc-w620-itemsSpacings-0-28" align="center" valign="middle" style="width: 100%; padding-top: 0px; padding-right: 0px; padding-bottom: 14px; padding-left: 0px;">
                      <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td align="center" valign="middle">
                         <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td align="center" style="padding: 0px 0px 0px 0px;">
                               <table class="pc-width-hug pc-w620-gridCollapsed-0" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr class="pc-grid-tr-first pc-grid-tr-last">
                                 <td class="pc-grid-td-first pc-w620-itemsSpacings-20-0" valign="middle" style="padding-top: 0px; padding-right: 14px; padding-bottom: 0px; padding-left: 0px;">
                                  <table style="border-collapse: separate; border-spacing: 0;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td valign="top">
                                           <img src="https://res.cloudinary.com/dyv5zfnit/image/upload/v1732099443/email/97d1e3e2fd722d0140b51806fa857340_aicfsa.png" class="" width="24" height="24" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 24px; height: 24px;" alt="" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-w620-itemsSpacings-20-0" valign="middle" style="padding-top: 0px; padding-right: 14px; padding-bottom: 0px; padding-left: 14px;">
                                  <table style="border-collapse: separate; border-spacing: 0;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td valign="top">
                                           <img src="https://res.cloudinary.com/dyv5zfnit/image/upload/v1732099444/email/fe68152620e8c8adcbb7728bd667dadb_fmcwzw.png" class="" width="24" height="24" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 24px; height: 24px;" alt="" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-grid-td-last pc-w620-itemsSpacings-20-0" valign="middle" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 14px;">
                                  <table style="border-collapse: separate; border-spacing: 0;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td valign="top">
                                           <img src="https://res.cloudinary.com/dyv5zfnit/image/upload/v1732099443/email/1653acc9769ff508be2f3ac82aef2d63_ivwx3i.png" class="" width="24" height="24" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 24px; height: 24px;" alt="" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                    <tr>
                     <td class="pc-grid-td-first pc-grid-td-last pc-w620-itemsSpacings-0-28" align="center" valign="middle" style="width: 100%; padding-top: 14px; padding-right: 0px; padding-bottom: 14px; padding-left: 0px;">
                      <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td align="center" valign="middle">
                         <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td valign="top" style="padding: 0px 0px 12px 0px;">
                               <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                <tr>
                                 <td valign="top" align="center" style="padding: 0px 0px 0px 0px;">
                                  <div class="pc-font-alt" style="line-height: 133%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 20px; font-weight: 600; font-variant-ligatures: normal; color: #ffffff; text-align: center; text-align-last: center;">
                                   <div><span>Thank you for supporting Funzy!</span>
                                   </div>
                                  </div>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td class="pc-w620-spacing-0-0-0-0" valign="top" style="padding: 0px 0px 0px 0px;">
                               <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                <tr>
                                 <td valign="top" class="pc-w620-padding-0-0-0-0" align="center" style="padding: 0px 0px 0px 0px;">
                                  <div class="pc-font-alt pc-w620-fontSize-15px" style="line-height: 160%; letter-spacing: -0.3px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #ffffffbf; text-align: center; text-align-last: center;">
                                   <div><span>We are a locally owned business that seeks to develop domestic products so they can compete with imported products. Your criticism and suggestions will be very helpful because your satisfaction is our priority.</span>
                                   </div>
                                  </div>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                    <tr class="pc-grid-tr-last">
                     <td class="pc-grid-td-first pc-grid-td-last pc-w620-itemsSpacings-0-28" align="center" valign="middle" style="width: 100%; padding-top: 14px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                      <table style="border-collapse: separate; border-spacing: 0; width: 100%;" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td align="center" valign="middle">
                         <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td class="pc-w620-spacing-0-0-12-0" valign="top" style="padding: 0px 0px 8px 0px;">
                               <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                <tr>
                                 <td valign="top" class="pc-w620-padding-0-0-0-0" align="center" style="padding: 0px 0px 0px 0px;">
                                  <div class="pc-font-alt pc-w620-fontSize-14px" style="line-height: 160%; letter-spacing: -0.3px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #ffffff; text-align: center; text-align-last: center;">
                                   <div><span style="color: rgb(255, 255, 255);">4517 Washington Ave. Manchester, KY 39495</span>
                                   </div>
                                  </div>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td align="center">
                               <table class="pc-width-hug pc-w620-gridCollapsed-0" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr class="pc-grid-tr-first pc-grid-tr-last">
                                 <td class="pc-grid-td-first pc-w620-itemsSpacings-4-30" valign="middle" style="padding-top: 0px; padding-right: 4px; padding-bottom: 0px; padding-left: 0px;">
                                  <table style="border-collapse: separate; border-spacing: 0;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #f5c04e; text-align: center; text-align-last: center;">
                                            <div><span>Unsubscribe</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-w620-itemsSpacings-4-30" valign="middle" style="padding-top: 0px; padding-right: 4px; padding-bottom: 0px; padding-left: 4px;">
                                  <table style="border-collapse: separate; border-spacing: 0;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 500; font-variant-ligatures: normal; color: #f5c04e; text-align: center; text-align-last: center;">
                                            <div><span>|</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-grid-td-last pc-w620-itemsSpacings-4-30" valign="middle" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 4px;">
                                  <table style="border-collapse: separate; border-spacing: 0;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Hanken Grotesk', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #f5c04e; text-align: center; text-align-last: center;">
                                            <div><span>Manage Reference</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Footer -->
         </td>
        </tr>
        <tr>
         <td>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
           <tr>
          
           </tr>
          </table>
         </td>
        </tr>
       </table>
      </td>
     </tr>
    </table>
   </td>
  </tr>
 </table>
 <!-- Fix for Gmail on iOS -->
 <div class="pc-gmail-fix" style="white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
 </div>
</body>
</html>`;
