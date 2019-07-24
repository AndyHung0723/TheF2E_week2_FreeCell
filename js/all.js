// 設定元件
setDragAndDrag();

function setDragAndDrag() {
    // 設定拉動元件
    $('.card-item-drag, .card-item-drag-group').draggable({ 
        revert: "invalid",
        start: function(e) {
            e.target.style.zIndex = 2;
        }
    });

    // 設定放置元件
    $('.card-item-drop').droppable({
        drop:function(event, ui) {
            // ui.draggable：拉動的元件
            // $(this)：放置的目標元件
            // 不可放置，回到原位
            if(
                // 放置目標為本位區，且不為 A 也不為 2
                ($($(this).get(0)).hasClass('card-item-collect') && $(ui.draggable.get(0)).children().data('rank') != '1' && $(ui.draggable.get(0)).children().data('rank') != '2') 
                ||
                // 放置目標不為本位區且放置目標列為本位列，且不符合放置規則 (大放到小且花色相同)
                (($($(this).get(0)).parent().hasClass('card-items-top') && !$($(this).get(0)).hasClass('card-item-collect')) && !($($(this).get(0)).children().data('rank') == ($(ui.draggable.get(0)).children().data('rank') - 1) && $($(this).get(0)).children().data('suit') == $(ui.draggable.get(0)).children().data('suit')))
                ||
                // 空白欄且數量多於一個
                ($($(this).get(0)).parent().hasClass('card-items-temp') && $($(this).get(0)).parent().children().length > 1)
                ||
                // 移動欄且不為基座
                (
                    ($($(this).get(0)).parent().hasClass('card-items-bottom') && !$($(this).get(0)).hasClass('card-item-base'))
                    &&
                    (
                        // 同色
                        $($(this).get(0)).children().data('suit') == $(ui.draggable.get(0)).children().data('suit')
                        ||
                        // 小到大
                        $(ui.draggable.get(0)).children().data('rank') != ($($(this).get(0)).children().data('rank') - 1)
                    )
                )
              ) {
                ui.draggable.animate(ui.draggable.data().uiDraggable.originalPosition,"slow");
                // 將拉動元件位置歸位
                ui.draggable.get(0).style.top = 0;
                ui.draggable.get(0).style.bottom = 0;
                ui.draggable.get(0).style.left = 0;
                ui.draggable.get(0).style.right = 0;
                // z-index 復原
                ui.draggable.get(0).style.zIndex = 'auto';
            } else {
                // 將拉動元件的前一個元素改為可拉動、可放置
                if($(ui.draggable.get(0)).prev().hasClass('card-item-top') || $(ui.draggable.get(0)).prev().hasClass('card-item-base')) {
                     // 如果放置的是上方元素或是下方基座，改為可放置就好
                    $(ui.draggable.get(0)).prev().addClass('card-item-drop');
                } else {
                    $(ui.draggable.get(0)).prev().addClass('card-item-drag card-item-drop');
                }
                // 將拉動元件位置歸位
                ui.draggable.get(0).style.top = 0;
                ui.draggable.get(0).style.bottom = 0;
                ui.draggable.get(0).style.left = 0;
                ui.draggable.get(0).style.right = 0;
                // z-index 復原
                ui.draggable.get(0).style.zIndex = 'auto';
                // 將拉動元件放到放置元件下方，並移除原本拉動元件
                $(this).after(ui.draggable.detach());
                // 將放置目標元件改為不可拉動、不可放置
                if(!$($(this).get(0)).hasClass('card-item-top')) {
                    // 如果是上方元素的話，不會有拉動效果
                    $($(this).get(0)).draggable('destroy');
                }
                $($(this).get(0)).droppable('destroy');
                $($(this).get(0)).removeAttr('style');
                $($(this).get(0)).removeClass('card-item-drag card-item-drop ui-draggable ui-draggable-handle ui-droppable');
                // 再呼叫一次設定
                setDragAndDrag();
            }
        }
    });
}