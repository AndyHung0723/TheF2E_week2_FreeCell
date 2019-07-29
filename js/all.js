$(function () {
    $('#modal-init').show();
    setModal();
});

// 設定牌局
function setGame() {
    var suit = ['spade','club','heart','diamond'];
    var rank = ['1','2','3','4','5','6','7','8','9','10','11','12','13'];
    var all = [];
    for(var i = 0 ; i < suit.length ; i++) {
        for(var j = 0 ; j < rank.length ; j++) {
            all.push(suit[i] + "-" + rank[j]);
        }
    }
    // 打亂排組
    all = shuffle(all);
    // 將排組 append 到列上
    var cnt = 0;
    $('.card-items-bottom').each((index, el) => {
        var len = index > 3 ? 6 : 7;
        for(var i = 0 ; i < len ; i++) {
            if(i == len-1) {
                $(el).append('<li class="card-item card-item-bottom card-item-drop"><img class="card-item-bottom__icon" src="img/card-'+all[cnt].split('-')[0]+'-'+all[cnt].split('-')[1]+'.svg" data-suit="'+all[cnt].split('-')[0]+'" data-rank="'+all[cnt].split('-')[1]+'" /></li>');
            }else {
                $(el).append('<li class="card-item card-item-bottom"><img class="card-item-bottom__icon" src="img/card-'+all[cnt].split('-')[0]+'-'+all[cnt].split('-')[1]+'.svg" data-suit="'+all[cnt].split('-')[0]+'" data-rank="'+all[cnt].split('-')[1]+'" /></li>');
            }
            cnt++;
        }
    });
    // 將記錄步數資料清空
    localStorage.setItem('step_record', '[]');
    localStorage.setItem('current_step', '[]');
}
//設定拉動元件
function setDrag() {
    // mousedown 時再即時去判斷是否為 draggable
    $('.card-item-bottom').mousedown((e) => {
        var current_item = $(e.target).parent();
        // 先由空白欄剩餘數量判斷最多還可以拉幾張卡
        var max_drag = 1;
        $('.card-items-temp').each((index, el) => {
            if($(el).children().length == 1) {
                max_drag++;
            }
        });
        // 判斷是否為最多可拉張數以內
        if($(current_item).nextAll().addBack().length <= max_drag) {
            // 判斷是否按照順序排好，為可拉動的多張列
            var isDrag = true;
            var value = $(current_item).children().data('rank');
            $(current_item).nextAll().each((index, el) => {
                value--;
                if($(el).children().data('rank') != value) {
                    isDrag = false;
                }
            });
            // 確定為可拉動
            if(isDrag) {
                // 將外層包上 div
                $(current_item).nextUntil("ul").addBack().wrapAll('<div class="card-item-group"></div>');
                // 綁定 mouseup 事件移除 div，避免沒有移除到的情況
                $('.card-item-group').mouseup((e) => {
                    // 如果不是 drag 再用 mouseup 進行移除
                    if(!$('.card-item-group').hasClass('ui-draggable-dragging')) {
                        $(e.target).parent().unwrap();
                    }
                });
                // 將 div 設為 drag
                $('.card-item-group').draggable({ 
                    revert: "invalid",
                    start: function(e) {
                        e.target.style.zIndex = 2;
                    },
                    stop: function(e) {
                        // 移除 group
                        $(e.target).children().unwrap();
                    }
                });
                // 再觸發一次 mousedown 事件 
                $('.card-item-group').trigger(e);
            }
        }
    });
}
// 設定放置元件
function setDrop() {
    $('.card-item-drop').droppable({
        drop:function(event, ui) {
            // ui.draggable：拉動的元件
            // $(this)：放置的目標元件
            // 將拉動元件位置歸位
            ui.draggable.get(0).style.top = 0;
            ui.draggable.get(0).style.bottom = 0;
            ui.draggable.get(0).style.left = 0;
            ui.draggable.get(0).style.right = 0;
            // z-index 復原
            ui.draggable.get(0).style.zIndex = 'auto';
            // 不可放置，回到原位
            if(
                // 放置目標為本位區，且不為 A 也不為 2
                ($($(this).get(0)).hasClass('card-item-collect') && ($(ui.draggable.get(0)).children().first().children().data('rank') != '1' && $(ui.draggable.get(0)).children().first().children().data('rank') != '2' || $($(this).get(0)).children().data('suit') != $(ui.draggable.get(0)).children().first().children().data('suit'))) 
                ||
                // 放置目標不為本位區且放置目標列為本位列，且不符合放置規則 (大放到小且花色相同)
                (($($(this).get(0)).parent().hasClass('card-items-top') && !$($(this).get(0)).hasClass('card-item-collect')) && !($($(this).get(0)).children().data('rank') == ($(ui.draggable.get(0)).children().first().children().data('rank') - 1) && $($(this).get(0)).children().data('suit') == $(ui.draggable.get(0)).children().first().children().data('suit')))
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
                        (
                            $($(this).get(0)).children().data('suit') == 'spade' && ($(ui.draggable.get(0)).children().first().children().data('suit') == 'spade' || $(ui.draggable.get(0)).children().first().children().data('suit') == 'club')
                            ||
                            $($(this).get(0)).children().data('suit') == 'club' && ($(ui.draggable.get(0)).children().first().children().data('suit') == 'spade' || $(ui.draggable.get(0)).children().first().children().data('suit') == 'club')
                            ||
                            $($(this).get(0)).children().data('suit') == 'diamond' && ($(ui.draggable.get(0)).children().first().children().data('suit') == 'diamond' || $(ui.draggable.get(0)).children().first().children().data('suit') == 'heart')
                            ||
                            $($(this).get(0)).children().data('suit') == 'heart' && ($(ui.draggable.get(0)).children().first().children().data('suit') == 'diamond' || $(ui.draggable.get(0)).children().first().children().data('suit') == 'heart')
                        )
                        ||
                        // 小到大
                        $(ui.draggable.get(0)).children().first().children().data('rank') != ($($(this).get(0)).children().data('rank') - 1)
                    )
                )
            ) {
                ui.draggable.animate(ui.draggable.data().uiDraggable.originalPosition,"slow");
            } else {
                // 紀錄走過的路
                var step_record = JSON.parse(localStorage.getItem('step_record'));
                step_record.push({suit: ''+$(ui.draggable.get(0)).prev().children().data('suit')+'', rank: ''+$(ui.draggable.get(0)).prev().children().data('rank')+''});
                localStorage.setItem('step_record', JSON.stringify(step_record));
                // 紀錄目前卡片
                var current_step = JSON.parse(localStorage.getItem('current_step'));
                current_step.push({suit: ''+$(ui.draggable.get(0)).children().first().children().data('suit')+'', rank: ''+$(ui.draggable.get(0)).children().first().children().data('rank')+''});
                localStorage.setItem('current_step', JSON.stringify(current_step));
                // 將拉動元件的前一個元素改為可放置
                $(ui.draggable.get(0)).prev().addClass('card-item-drop');
                // 將拉動元件位置歸位
                ui.draggable.get(0).style.top = 0;
                ui.draggable.get(0).style.bottom = 0;
                ui.draggable.get(0).style.left = 0;
                ui.draggable.get(0).style.right = 0;
                // z-index 復原
                ui.draggable.get(0).style.zIndex = 'auto';
                // 將拉動元件放到放置元件下方，並移除原本拉動元件
                $(this).after(ui.draggable.detach());
                $($(this).get(0)).droppable('destroy');
                $($(this).get(0)).removeAttr('style');
                $($(this).get(0)).removeClass('card-item-drag card-item-drop ui-draggable ui-draggable-handle ui-droppable');
                // 再呼叫一次設定
                setDrop();
            }
        }
    });
}
// 設定選單動作
function setMenuAction() {
    setUndo();
    setStartGame();
    setRestart();
}
// 設置上一步
function setUndo() {
    $('#undo').click((e) => {
        var step_record = JSON.parse(localStorage.getItem('step_record'));
        var current_step = JSON.parse(localStorage.getItem('current_step'));
        if(step_record.length != 0 && current_step.length != 0) {
            // 取得上一步
            var last_step = step_record[step_record.length-1];
            var last_step_obj = $('[data-suit="'+last_step.suit+'"][data-rank="'+last_step.rank+'"]').parent();
            // 取得目前步
            var present_step = current_step[current_step.length-1];
            var current_step_obj = $('[data-suit="'+present_step.suit+'"][data-rank="'+present_step.rank+'"]').parent();
            // 將上一步上方元素的 drop class 移除
            if(last_step_obj.hasClass('card-item-drop')) {
                last_step_obj.droppable('destroy');
                last_step_obj.removeClass('card-item-drop ui-droppable');
            }
            // 將目前步的上方元素加上 drop 特性
            current_step_obj.prev().addClass('card-item-drop');
            // 將元素還原到上一步
            last_step_obj.after(current_step_obj.detach());
            // 將移除目前步與上一步的最後一筆
            step_record = step_record.slice(0, -1);
            current_step = current_step.slice(0, -1);
            localStorage.setItem('step_record', JSON.stringify(step_record));
            localStorage.setItem('current_step', JSON.stringify(current_step));
            // 再呼叫一次設定 drop
            setDrop();
        }else {
            $('#modal-undo').show();
        }
    });
}
// 設置開始與暫停
var timeoutID = null;
function setStartGame() {
    $('#play').click((e) => {
        if($('#play').children('span').text() == 'PAUSE') {
            // 改變 icon
            $('#play').children('i').text('play_arrow');
            $('#play').children('span').text('START');
            window.clearInterval(timeoutID);
            $('#modal-start').show();
        }else {
            // 改變 icon
            $('#play').children('i').text('pause');
            $('#play').children('span').text('PAUSE');
            // 開始計時
            timeoutID = window.setInterval(function() {
                var timer_min = parseInt($('.timer__text').text().split(':')[0]);
                var timer_sec = parseInt($('.timer__text').text().split(':')[1]);
                timer_sec++;
                if(timer_sec == 60) {
                    timer_min++;
                    timer_sec = 0;
                }
                if(timer_min == 0 || timer_min < 10) timer_min = "0" + timer_min
                if(timer_sec == 0 || timer_sec < 10) timer_sec = "0" + timer_sec;
                $('.timer__text').text(timer_min + ':' + timer_sec);
            }, 1000);
        }
    });
}
// 設置重新開始
function setRestart() {
    $('#restart').click((e) => {
        $('#play').click();
        $('#modal-restart').show();
    });
    
}
// 清除場面上所有牌
function clearGame() {
    $('.card-item-bottom').remove();
}
// 設定 Dialog
function setModal() {
    $('.modal-new__btn').click(() => {
        // 關閉 Modal
        setModalClose();
        // 設定選單動作
        setMenuAction();
        // 設定牌局
        setGame();
        // 設定拉動元件
        setDrag();
        // 設定放置元件
        setDrop();
        // 開始計時
        $('#play').click();
    });
    $('.modal-close__btn') .click(() => {
        setModalClose();
    });
    $('.modal-start__btn').click(() => {
        $('#play').click();
        setModalClose();
    });
    $('.modal-restart__btn').click(() => {
        // 關閉 Modal
        setModalClose();
        // 清空場面
        clearGame();
        // 重新設定牌局
        setGame();
        // 設定拉動元件
        setDrag();
        // 設定放置元件
        setDrop();
        // 時間重設
        $('.timer__text').text('00:00');
        // 開始計時
        $('#play').click();
    });
    $('.modal-cancel__btn').click(() => {
        // 關閉 Modal
        setModalClose();
        // 開始計時
        $('#play').click();
    });
}
// 設定 Dialog 關閉
function setModalClose() {
    // 關閉 Modal
    $('.modal').css('opacity', '0');
    $('.modal').css('top', '-500px');
    window.setTimeout( () => {
        $('.modal').addClass('notransition');
        $('.modal').hide();
        $('.modal').css('opacity', '1');
        $('.modal').css('top', '0');
        $('.modal')[0].offsetHeight;
        $('.modal').removeClass('notransition'); 
    }, 1000);
}
// 將 array 打亂
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}