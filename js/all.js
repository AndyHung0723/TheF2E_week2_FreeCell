setDragAndDrag();

function setDragAndDrag() {
    // 設定拉動元件
    $('.card-item-drag').draggable({ 
        revert: "invalid",
        start: function(e) {
            e.target.style.zIndex = 2;
        }
    });

    // 設定放置元件
    $( ".card-item-drop" ).droppable({
        drop:function(event, ui) {
            // ui.draggable：拉動的元件
            // $(this)：放置的目標元件
            
            if(false) {
                // 不可放置，回到原位
                ui.draggable.animate(ui.draggable.data().uiDraggable.originalPosition,"slow");
            } else {
                // 將拉動元件的前一個元素改為可拉動
                $(ui.draggable.get(0)).prev().addClass('card-item-drag card-item-drop');
                // 將拉動元件位置歸位，並搬移到放置目標元件下方
                ui.draggable.get(0).style.top = 0;
                ui.draggable.get(0).style.bottom = 0;
                ui.draggable.get(0).style.left = 0;
                ui.draggable.get(0).style.right = 0;
                // z-index 復原
                ui.draggable.get(0).style.zIndex = 'auto';
                $(this).after(ui.draggable.detach());
                // 將放置目標元件改為不可拉動、不可放置
                $($(this).get(0)).droppable('destroy');
                $($(this).get(0)).draggable('destroy');
                $($(this).get(0)).removeAttr('style');
                $($(this).get(0)).removeClass('card-item-drag card-item-drop ui-draggable ui-draggable-handle ui-droppable');
                // 再呼叫一次設定
                setDragAndDrag();
            }
        }
    });
}