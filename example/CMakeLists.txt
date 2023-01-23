if(${CMAKE_CURRENT_SOURCE_DIR} STREQUAL ${CMAKE_CURRENT_BINARY_DIR})
   message(FATAL_ERROR "In-tree builds are not allowed! Please run \"cmake -S ${CMAKE_SOURCE_DIR} -B ${CMAKE_SOURCE_DIR}/dist\" and using it.")
endif()

cmake_minimum_required(VERSION 3.25)
project(hello)

#region METRO_BUILD
# AUTO GENERATED
# <-- Hello -->
	# pre-commands
	add_executable(Hello)
	block(PROPAGATE LATEST_TARGET)
		set(CURRENT_TARGET Hello)
		set(LATEST_TARGET Hello)
			if(CMAKE_SIZEOF_VOID_P EQUAL 8)
			# 64 bits
			# <-- source -->
				# This is source target
				target_sources(Hello
					PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}/src/main.cpp"
				)
				target_include_directories(Hello
					INTERFACE "${CMAKE_CURRENT_SOURCE_DIR}/include"
				)
			# <-- source -->
			# <-- include -->
				# This is include only target
				target_include_directories(Hello
					INTERFACE include
				)
			# <-- include -->
			# <-- static -->
				# This is static library target
				add_library(Hello_STATIC_0 STATIC IMPORTED)
				block(PROPAGATE LATEST_TARGET)
					set(CURRENT_TARGET Hello_STATIC_0)
					set(LATEST_TARGET Hello_STATIC_0)
					set_target_properties(Hello_STATIC_0 PROPERTIES INTERFACE_INCLUDE_DIRECTORIES
						"${CMAKE_CURRENT_SOURCE_DIR}/hello/include"
					)
					set_target_properties(Hello_STATIC_0 PROPERTIES IMPORTED_LOCATION "${CMAKE_CURRENT_BINARY_DIR}/hello/lib/Hello.lib")
					target_link_libraries(Hello INTERFACE Hello_STATIC_0)
				endblock()
			# <-- static -->
			# <-- shared -->
				# This is shared library target
				add_library(Hello_SHARED_1 SHARED IMPORTED)
				block(PROPAGATE LATEST_TARGET)
					set(CURRENT_TARGET Hello_SHARED_1)
					set(LATEST_TARGET Hello_SHARED_1)
					set_target_properties(Hello_SHARED_1 PROPERTIES IMPORTED_IMPLIB "${CMAKE_CURRENT_SOURCE_DIR}/hello/lib/Hello.lib")
					set_target_properties(Hello_SHARED_1 PROPERTIES IMPORTED_LOCATION "${CMAKE_CURRENT_SOURCE_DIR}/hello/bin/Hello.dll")
					target_link_libraries(Hello INTERFACE Hello_SHARED_1)
				endblock()
			# <-- shared -->
			endif()
	endblock()
	# post-commands
# <-- Hello -->
#endregion METRO_BUILD

message(Complete)