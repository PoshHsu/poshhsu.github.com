/**
 * Created by kurtsgm on 16/8/6.
 */

(function() {
  'use strict';

  jQuery.fn.liteshop = function (options) {
    var product_token= options["product_token"]
    var user_token = options["u"]
    var _target_form_div = this;
    var _url = 'https://liteshop.tw/';
    var cart_changed = true;
    var cart_token_key = 'liteshop-cart-token';
    if (options['development'] == true) {
      _url = "http://localhost:3000/"
    }
    var defaults = {
      development: false,
      variant: "#variant-select"
    };

    var options = jQuery.extend({}, defaults, options || {});
    var _variant_data = [];

    function isValidEmailAddress(emailAddress) {
      var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
      return pattern.test(emailAddress);
    };

    jQuery('head').append('<link rel="stylesheet" href="'+_url+'assets/liteshop-order-form.css" type="text/css" />');
    jQuery('head').append('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" type="text/css" />');
    function createCookie(name, value, days) {
      var expires;
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
      } else {
        expires = "";
      }
      document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
    }

    function readCookie(name) {
      var nameEQ = encodeURIComponent(name) + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
      return null;
    }

    function eraseCookie(name) {
      createCookie(name, "", -1);
    }
    function getCart(){
      return readCookie(cart_token_key)
    }

    //function cartLink(){
    //  var isSafari = navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1;
    //  var cart_link =_url+"carts/new/"
    //  if(isSafari){
    //    cart_link += "?cart_token=" +readCookie(cart_token_key)
    //  }
    //  return cart_link
    //}


    function setCartCookie(cart_token){
      var isSafari = navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1;
      createCookie(cart_token_key, cart_token , 3);
      if(jQuery('#liteshop-cart-token').length == 0){
        if(!isSafari){
          var params = _url + "cookie?cart_token=" + cart_token;
          jQuery(".cart-btn-wrap").append('<img src="'+params+'" id="liteshop-cart-token" style="display:none"/>')
        }
      }
    }

    function addToCart(shop_id,variant_id,quantity){
      var _data = {variant_id:variant_id, quantity:quantity,product_token:product_token}
      if(quantity <= 0){
        return false;
      }
      var token = readCookie(cart_token_key)
      if(token!=null){
        _data["cart_token"] = token;
      }
      if(options['notify']!=null && isValidEmailAddress(options['notify'])){
        _data["email_notify"] = options['notify']
      }
      _data["u"] = user_token;
      try {
        fbq('track', 'AddToCart');
      } catch (e) {
      }
      try {
        ga('send', 'event', '鞈潛�頠�', '��惩�亥頃��頠�');
      } catch (e) {
      }
      jQuery.ajax({
        url : _url + "carts/add.json",
        data: _data,
        type: "POST",
        success: function(data) {
          jQuery('.liteshop-checkout-btn span').html(data.count)
          setCartCookie(data.cart_token)
          updateCart(data.detail,jQuery(".liteshop-btn.openCart"))
          cart_changed = false;
          if(data.count > 0){
            jQuery('.liteshop-btn.openCart').show();
            jQuery('.liteshop-btn.liteshop-checkout-btn').show();
          }
        }
      });
    }

    function updateCart(cart,detail_btn){
      var cart_detail = jQuery(".liteshop-cart .cartdetail");
      jQuery(cart_detail).html('')
      jQuery.each(cart, function (id, shop_cart) {
        var shop_detail = jQuery("<thead><tr> <th class='store-name' colspan='2'>" + shop_cart.shop_title + "</th> </tr></thead><tbody></tbody>")
        jQuery.each(shop_cart.items, function (index) {
          jQuery(shop_detail[1]).append("<tr> <td class='product-name'> " +
            "<div class='ls-name'>" + shop_cart.items[index].product_title + "</div><div class='ls-type'>" + shop_cart.items[index].variant_title + " <span class='quantity'><small>x</small>" + shop_cart.items[index].quantity + "</span></div></td><td class='subtotal'><small>$</small> "+shop_cart.items[index].subtotal+"</td></tr>")
        })
        jQuery(cart_detail).append(shop_detail)
      })
      jQuery(detail_btn).prop('disabled', false)
      cart_changed = false;
    }

    function formOnFocus() {
      jQuery('.liteshop-form-control').focus(function(){
        jQuery(this).parent().addClass('form-focus')
      })
      jQuery('.liteshop-form-control').blur(function(){
        jQuery(this).parent().removeClass('form-focus')
      })
    }



    var _product_info_url = _url+'get_product_info.json?callback=?';
    var get_info_params = {product_token: product_token,u:user_token};
    if(getCart()){
      get_info_params["cart_token"] = getCart()
    }

    jQuery.ajax(_product_info_url, {
      type: 'get',
      data: get_info_params,
      dataType: 'jsonp',
      success: function (data) {
        console.log(data);
        var _select;
        var _quantity_select = jQuery("<select id='productQuantity' class='liteshop-form-control liteshop-quantity-select'></select>");
        var _open_cart_detail = jQuery("<button class='liteshop-btn btn-link openCart' data-toggle='LScollapse' data-target='.lsShopCart' data-expanded='no'>��𡒊敦</button>")
        var _add_to_cart = jQuery("<button class='liteshop-btn btn-add-cart'>��惩�亥頃��頠�</button>")
        jQuery(_target_form_div).wrap("<div class='liteshop-order-container'></div>")

        if(data.success != true){
          _target_form_div.html("<span style='color:red'>"+data.message+"</span>");
          return false;
        }
        if(data.cart_token){
          setCartCookie(data.cart_token);
        }

        _variant_data = data.variants || [];
        if(_variant_data) {
          _select = jQuery("<select id='productName' class='liteshop-form-control variant-select'></select>")
          console.log(_variant_data)
          for(i=0;i<_variant_data.length;i++){
            var _option = jQuery("<option value='"+_variant_data[i].id+"' data-stock='"+_variant_data[i].stock+"'>"+_variant_data[i].title+ " - NT$" +_variant_data[i].price+"</option>")
            jQuery(_option).data("stock", _variant_data[i].stock);
            _select.append(_option)
          }
          jQuery(_target_form_div).addClass('cartdetail-wrapper').append("<h3 class='form-heading'>鞈潸眺��"+data.product_title+"��</h3>").append("<h4 class='form-heading-descript'>隢钅�豢��炬鞈潸眺���������彍��𧶏��朖�虾��惩�亥頃��頠𠰴�𣬚�𣂼董��</h4>");

          jQuery(_target_form_div).append(_select);
          jQuery(_select).wrap("<div class='col-6'></div>").wrap("<div class='liteshop-form-group form-select'></div>").parent().prepend("<label class='liteshop-form-label label-at-top' for='productName'>����璅���</lable>");

          jQuery(_target_form_div).append(_quantity_select);
          jQuery(_quantity_select).wrap("<div class='col-6'></div>").wrap("<div class='liteshop-form-group form-select'></div>").parent().prepend("<label class='liteshop-form-label label-at-top' for='productQuantity'>鞈潸眺�彍���"+(data.limit_purchase ? "  (��鞱頃"+data.limit_purchase+")" : "")+"</lable>");
          jQuery(_target_form_div).find( ".col-6" ).wrapAll( "<div class='row'></div>" );
          if(_variant_data[0].stock < 1 && !data.allow_preorder){
            jQuery(_quantity_select).append("<option value='0'>撌脣睸摰�</option>")
            jQuery(_add_to_cart).addClass("disabled")
          }else{
            var _max_purchase = _variant_data[0].stock
            if(data.allow_preorder){
              _max_purchase = 10
            }
            if (data.limit_purchase && data.limit_purchase < _max_purchase){
              _max_purchase = data.limit_purchase
            }
            for(var i=1;i<= _max_purchase;i++){
              if(_variant_data[0].stock >= i){
                jQuery(_quantity_select).append("<option value='"+i+"'>"+i+"</option>")
              }else if(data.allow_preorder){
                jQuery(_quantity_select).append("<option value='"+i+"'>"+i+" (��𣂼睸)</option>")
              }
            }
          }
        }
        jQuery(_add_to_cart).on('click',function(){
          var _selected_variant = jQuery(_select).find(":selected");
          addToCart(data.shop_id,jQuery(_selected_variant).val(),jQuery(_quantity_select).val())
        })
        jQuery(_select).on("change",function(event){
          var _stock = jQuery(event.currentTarget).find(":selected").data("stock") > 10 ? 10 : jQuery(event.currentTarget).find(":selected").data("stock");
          var _quantity_select = jQuery('.liteshop-quantity-select');
          _quantity_select.html("")
          if((_stock < 1 || isNaN(_stock)) && !data.allow_preorder ){
            _quantity_select.append("<option value='0'>撌脣睸摰�</option>")
            jQuery(_add_to_cart).addClass("disabled")
          }else{
            var _max_purchase = _stock
            if(data.allow_preorder){
              _max_purchase = 10
            }
            if (data.limit_purchase && data.limit_purchase < _max_purchase){
              _max_purchase = data.limit_purchase
            }
            for(var i=1;i<=_max_purchase;i++){
              if(i>_stock){
                _quantity_select.append("<option value='"+i+"'>"+i+"(��鞱頃)</option>")
              }else{
                _quantity_select.append("<option value='"+i+"'>"+i+"</option>")
              }
              jQuery(_add_to_cart).removeClass("disabled")
            }
          }
        })

        var _send_cart = jQuery("<a class='liteshop-btn liteshop-checkout-btn' href='"+_url+"carts/new'>蝯𣂼董<span class='ls-badge'></span></a>")
        jQuery(_send_cart).on('click',function(event){
          event.preventDefault();
          var final_url = new URL(this.href)
          final_url.searchParams.append('cart_token', readCookie(cart_token_key));
          window.location = final_url.href;
        });

        jQuery(_send_cart).find('span').html(data.cart_count);
        if(data.cart_count <= 0){
          jQuery(_open_cart_detail).hide();
          jQuery(_send_cart).hide();
        }
        jQuery(_target_form_div).append("<div class='cart-btn-wrap'></div>");
        jQuery(_target_form_div).find(".cart-btn-wrap").append(_add_to_cart);
        jQuery(_target_form_div).find(".cart-btn-wrap").append(_send_cart);
        jQuery(_target_form_div).find(".cart-btn-wrap").append(_open_cart_detail);
        jQuery(_target_form_div).find(".cart-btn-wrap").find(".liteshop-btn").wrap("<div class='btn-group'></div>" );
        jQuery(_target_form_div).find(".btn-group").wrapAll("<div class='btn-warp'></div>");
        jQuery(_target_form_div).find(".cart-btn-wrap").append("<div class='liteshop-cart hideNow lsShopCart' id=''><table class='liteshop-table cartdetail'> <thead> </table></div>");
        jQuery(_target_form_div).append("<div class='cart-footer'></div>");
        jQuery(_target_form_div).find(".cart-footer").append("<span>Powered by</span><a href='//liteshop.tw' target='_blank' title='Powered by LiteShop 頛閖𤓖��'><img src='"+_url+"assets/liteshop-logo.png'></a>");

        jQuery(_open_cart_detail).on("click", function(){
          var collapseTarget = jQuery(this).attr("data-target")
          var targetShow = jQuery(this).attr("data-expanded")
          var _this = jQuery(this);
          var _curTarget = jQuery(this).closest('.cart-btn-wrap').children('.lsShopCart')
          var targetH = jQuery(collapseTarget).height();
          _curTarget.removeClass('hideNow')
          if (targetShow === "no") {
            if(cart_changed) {
              var _cart_detail_url = _url + 'carts/detail.json?callback=?';
              jQuery(_open_cart_detail).prop('disabled', 'disabled');
              jQuery.ajax(_cart_detail_url, {
                type: 'get',
                data: get_info_params,
                dataType: 'jsonp',
                success: function (data) {
                  console.log(data)
                  updateCart(data.detail,_open_cart_detail)
                }
              });
            }
            _curTarget.addClass('showIt').removeClass('hideIt');
            _this.addClass('in').attr({"data-expanded": "yes"});
          } else {
            _curTarget.removeClass('showIt').addClass('hideIt');
            _this.removeClass('in').attr({"data-expanded" : "no"});
          }
        })
        formOnFocus();
      }
    });
  };
}).call(this);;

