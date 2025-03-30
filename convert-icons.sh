#!/bin/bash

# Проверка наличия Inkscape или другого конвертера
if command -v inkscape &> /dev/null; then
    CONVERTER="inkscape"
    echo "Используем Inkscape для конвертации."
elif command -v convert &> /dev/null; then
    CONVERTER="convert"
    echo "Используем ImageMagick для конвертации."
else
    echo "Ошибка: Требуется Inkscape или ImageMagick (convert) для конвертации."
    exit 1
fi

# Пути к файлам
SOURCE_SVG="icon.svg"
OUTPUT_PNG="icon.png"
OUTPUT_152="icon-152.png"
OUTPUT_180="icon-180.png"
OUTPUT_LAUNCH="launch.png"

# Проверка наличия исходного файла
if [ ! -f "$SOURCE_SVG" ]; then
    echo "Ошибка: Файл $SOURCE_SVG не найден."
    exit 1
fi

# Функция конвертации с использованием доступного инструмента
convert_svg_to_png() {
    input=$1
    output=$2
    size=$3
    
    if [ "$CONVERTER" = "inkscape" ]; then
        inkscape -w $size -h $size $input -o $output
    elif [ "$CONVERTER" = "convert" ]; then
        convert -background none -size ${size}x${size} $input $output
    fi
    
    echo "Создан файл: $output (${size}x${size}px)"
}

# Создание иконок разных размеров
convert_svg_to_png $SOURCE_SVG $OUTPUT_PNG 512
convert_svg_to_png $SOURCE_SVG $OUTPUT_152 152
convert_svg_to_png $SOURCE_SVG $OUTPUT_180 180
convert_svg_to_png $SOURCE_SVG $OUTPUT_LAUNCH 1080

echo "Конвертация завершена." 