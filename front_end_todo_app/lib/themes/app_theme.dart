import 'package:flutter/material.dart';

/// Colors and type scale taken directly from the Figma style guide.
class AppColors {
  static const background = Color(0xFF0A0A0A);
  static const surface = Color(0xFF141414);

  /// "Pickle green" from the style guide — used for the input underline,
  /// the delete/trash icon, and the checked checkbox state.
  static const pickleGreen = Color(0xFF8DBB31);

  /// Red accent used for the unchecked checkbox outline and the add (+) button.
  static const red = Color(0xFFFF383C);

  static const white = Color(0xFFFFFFFF);
  static const white80 = Color(0xCCFFFFFF); // white at 80% opacity
}

class AppTextStyles {
  static const String _fontFamily = 'Gaegu';

  /// Heading 1 — Gaegu, 24, Bold (style guide spec).
  static TextStyle heading1({Color color = AppColors.white}) => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: color,
      );

  /// Text bold — Gaegu, 20, Bold (style guide spec).
  static TextStyle textBold({Color color = AppColors.white}) => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: color,
      );

  /// Regular body text, same handwritten family, not bold.
  static TextStyle body({Color color = AppColors.white80, double size = 16}) =>
      TextStyle(fontFamily: _fontFamily, fontSize: size, color: color);
}

class AppTheme {
  static ThemeData dark() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      fontFamily: 'Gaegu',
      colorScheme: const ColorScheme.dark(
        surface: AppColors.background,
        primary: AppColors.pickleGreen,
        error: AppColors.red,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: AppTextStyles.heading1(),
      ),
      textTheme: TextTheme(
        headlineSmall: AppTextStyles.heading1(),
        bodyLarge: AppTextStyles.textBold(),
        bodyMedium: AppTextStyles.body(),
      ),
    );
  }
}